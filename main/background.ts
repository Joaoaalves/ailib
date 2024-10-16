import {
    app,
    ipcMain,
    BrowserWindow,
    protocol,
    globalShortcut,
    IpcMainEvent,
} from "electron";
import path from "path";
import { createWriteStream, existsSync, mkdirSync, readFileSync } from "fs";
import {
    chatWithDocument,
    createConversationTitle,
    summarizePages,
    getMoreQueries,
    chatWithCollection,
} from "./lib/openai";

import Document from "./db/document";
import Collection from "./db/collection";
import Conversation from "./db/conversation";

import syncDatabase from "./db/sync";
import { processPDF } from "./lib/document";
import Message from "./db/message";
import {
    deletePointsForDocumentId,
    ensureCollectionsExists,
} from "./lib/qdrant";

import { RAGFusion } from "./lib/rag";
import Summary from "./db/summary";
import { associateDocumentToCollection } from "./lib/data";
import { saveCoverOnStorage, savePdfToStorage } from "./lib/file";
import { IDocument } from "shared/types/document";
import Config from "./db/config";
import createDefaultConfigsIfNotExists from "./helpers/defaultConfigs";
import TextChunk from "./db/textChunk";

const isProd = process.env.NODE_ENV === "production";

ipcMain.handle("createConversation", async (event, message) => {
    const title = await createConversationTitle(message);
    const conversation = await Conversation.create({ title });
    return JSON.parse(JSON.stringify(conversation));
});

ipcMain.handle("getConversationMessages", async (event, conversationId) => {
    const conversation = await Conversation.findByPk(conversationId, {
        include: Message,
        order: [["id", "ASC"]],
    });
    return JSON.parse(JSON.stringify(conversation));
});

ipcMain.handle("getConversations", async (event) => {
    const conversations = await Conversation.findAll();
    return JSON.parse(JSON.stringify(conversations));
});

ipcMain.handle("saveMessage", async (event, conversationId, message) => {
    try {
        const conversation = await Conversation.findByPk(conversationId);

        if (conversation) {
            const createdMessage = await Message.create({ ...message });

            // @ts-expect-error
            await conversation.addMessage(createdMessage);

            return createdMessage;
        } else {
            throw new Error("Conversation not found");
        }
    } catch (error) {
        console.error("Error saving message:", error);
        throw error;
    }
});

ipcMain.handle("chatWithCollection", async (event, messages, collectionId) => {
    await chatWithCollection(event, messages, collectionId);
});

ipcMain.handle("chatWithDocument", async (event, messages, documentId) => {
    await chatWithDocument(event, messages, documentId);
});

ipcMain.handle(
    "createDocument",
    async (
        event: IpcMainEvent,
        name: string,
        path: string,
        collectionId: number,
    ) => {
        const storagePdfPath = await savePdfToStorage(path, name);
        const doc = await Document.create({
            name,
            path: storagePdfPath,
        });
        if (doc) {
            await associateDocumentToCollection(collectionId, doc.id);

            return JSON.parse(JSON.stringify(doc));
        }

        return {
            error: "Document not found!",
        };
    },
);

ipcMain.handle(
    "saveCover",
    async (event: IpcMainEvent, documentId: number, cover: ArrayBuffer) => {
        const doc = await Document.findByPk(documentId);

        if (doc) {
            const buffer = Buffer.from(cover);

            //save cover on /storage/covers/ with the document.name value
            const coverPath = await saveCoverOnStorage(buffer, doc.name);

            //save cover path to document on db
            doc.cover = coverPath;

            await doc.save();
            return JSON.parse(JSON.stringify(doc));
        }

        return {
            error: "Document not found!",
        };
    },
);

ipcMain.handle(
    "updateDocument",
    async (
        event: IpcMainEvent,
        documentId: number,
        updateFields: IDocument,
    ) => {
        const doc = await Document.findByPk(documentId);

        if (doc) {
            await doc.update(updateFields);
            await doc.save();
            return JSON.parse(JSON.stringify(doc));
        }

        return {
            error: "Document not found!",
        };
    },
);

ipcMain.handle(
    "processPdf",
    async (
        event: IpcMainEvent,
        pages: string[],
        documentId: number,
        collectionId: number,
        processCount: number,
    ) => {
        const document = await Document.findByPk(documentId);
        if (!document) {
            return { error: "Document not found!" };
        }

        const totalPages = pages.length;
        const chunkSize = Math.ceil(totalPages / processCount);

        const intervals = [];
        for (let i = 0; i < processCount; i++) {
            const start = i * chunkSize;
            const end = start + chunkSize;
            intervals.push(pages.slice(start, end));
        }
        await Promise.all(
            intervals.map((pages, index) => {
                const offset = index * chunkSize;
                return processPDF({
                    event,
                    pages,
                    document,
                    collectionId,
                    offset,
                });
            }),
        );

        event.sender.send("embedding_complete");
    },
);

ipcMain.handle("getCollections", async (event) => {
    const collections = await Collection.findAll({ include: Document });
    return JSON.parse(JSON.stringify(collections));
});

ipcMain.handle("createCollection", async (event, collectionName) => {
    const collectionId = await Collection.create({ name: collectionName });
    return collectionId;
});

ipcMain.handle("updateCollection", async (event, collectionId, data) => {
    const collection = await Collection.findByPk(collectionId, {
        include: Document,
    });

    collection.set(data);

    await collection.save();

    return JSON.parse(JSON.stringify(collection));
});

ipcMain.handle("deleteCollection", async (event, collectionId) => {
    await Collection.destroy({
        where: {
            id: Number(collectionId),
        },
    });
});
ipcMain.handle("getDocument", async (event, documentId) => {
    const document = await Document.findByPk(Number(documentId));
    return JSON.parse(JSON.stringify(document));
});

ipcMain.handle("deleteDocument", async (event, documentId) => {
    await Document.destroy({
        where: {
            id: Number(documentId),
        },
    });

    await deletePointsForDocumentId(documentId);
});

ipcMain.handle("deleteConversation", async (event, conversationId) => {
    const conversation = await Conversation.findByPk(conversationId, {
        include: Message,
    });
    await Message.destroy({
        where: {
            id: {
                // @ts-expect-error
                includes: conversation.Messages.map((message) => message.id),
            },
        },
    });

    await conversation.destroy();
});

ipcMain.handle("setLastPageReadSave", async (event, documentId, page) => {
    const document = await Document.findByPk(documentId);

    if (document) {
        document.lastPageRead = page;
        await document.save();
    }
});

ipcMain.handle("search", async (event, query) => {
    const relevantQueries = await getMoreQueries(query);
    const queries = [query, ...relevantQueries];

    const RAGResult = await RAGFusion(queries);
    const document = await Document.findByPk(RAGResult[0].documentId);
    const textChunk = await TextChunk.findByPk(RAGResult[0].chunkId);
    return JSON.parse(
        JSON.stringify({
            content: textChunk.text,
            page: RAGResult[0].page,
            document,
        }),
    );
});

ipcMain.handle(
    "summarizePages",
    async (
        event: IpcMainEvent,
        documentId: number,
        pages: string[],
        summaryTitle: string,
    ) => {
        var lastSummary: string;

        const outputDir = path.join(
            __dirname,
            `/storage/summaries/${documentId}`,
        );
        const outputPath = path.join(outputDir, `${summaryTitle}.txt`);

        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        var writeStream = createWriteStream(outputPath, { flags: "a" });

        for (let i = 0; i < pages.length; i += 4) {
            const startingPage = i;
            const endingPage = Math.min(pages.length, i + 4);

            lastSummary = await summarizePages(
                event,
                pages.slice(startingPage, endingPage),
                lastSummary,
            );

            event.sender.send("summaryzingProgress", {
                progress: (endingPage * 100) / pages.length,
            });

            writeStream.write(lastSummary + "\n\n");
        }

        writeStream.end();

        const summary = await Summary.create({
            title: summaryTitle,
            path: outputPath,
            summaryType: "interval",
        });

        const document = await Document.findByPk(documentId);

        if (document) {
            //@ts-expect-error
            document.addSummary(summary);
        }

        event.sender.send("summaryzingComplete");
        return JSON.parse(JSON.stringify(summary));
    },
);

ipcMain.handle("getSummaries", async (event) => {
    return JSON.parse(JSON.stringify(await Summary.findAll()));
});

ipcMain.handle("getSummaryById", async (event, key) => {
    try {
        const summary = await Summary.findByPk(key);

        if (summary) {
            const data = readFileSync(summary.path, "utf-8");
            summary.dataValues.text = data;
            return JSON.parse(JSON.stringify(summary));
        }

        return JSON.parse(JSON.stringify({ error: "Summary Not Found!" }));
    } catch (error) {
        return JSON.parse(
            JSON.stringify({ error: "Error looking for Summary File." }),
        );
    }
});

ipcMain.handle("updateConfig", async (event, id, value) => {
    try {
        const config = await Config.findByPk(id);

        if (config) {
            config.value = value;
            await config.save();
            return JSON.parse(JSON.stringify(config));
        }
    } catch (error) {
        return {
            error: "Error updating Config",
        };
    }
});

ipcMain.handle("getConfigs", async () => {
    try {
        const configs = await Config.findAll();

        return JSON.parse(JSON.stringify(configs));
    } catch (error) {
        return {
            error: "Error geting Configs",
        };
    }
});

ipcMain.handle("close", (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.close();
});
ipcMain.handle("minimize", (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.minimize();
});

app.on("ready", async () => {
    await syncDatabase();
    await ensureCollectionsExists();
    await createDefaultConfigsIfNotExists();

    if (BrowserWindow.getAllWindows().length == 0) {
        const mainWindow = new BrowserWindow({
            width: 1000,
            height: 600,
            titleBarStyle: "hidden",
            transparent: true,
            webPreferences: {
                webSecurity: false,
                preload: path.join(__dirname, "preload.js"),
            },
        });

        protocol.registerFileProtocol("atom", (request, callback) => {
            const url = request.url.substr(7);
            callback({ path: url });
        });

        globalShortcut.register("CommandOrControl+R", () => {
            console.log("CommandOrControl+R is pressed: Shortcut Disabled");
        });
        globalShortcut.register("F5", () => {
            console.log("F5 is pressed: Shortcut Disabled");
        });

        if (isProd) {
            mainWindow.loadURL("app://./home");
        } else {
            const port = process.argv[2];
            mainWindow.loadURL(`http://localhost:${port}/home`);
            mainWindow.maximize();
        }

        mainWindow.on("closed", () => {
            app.quit();
        });
    }
});

app.on("window-all-closed", () => {
    app.quit();
});
