import {
    app,
    ipcMain,
    BrowserWindow,
    protocol,
    globalShortcut,
    IpcMainEvent,
} from "electron";
import path from "path";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import {
    saveApiKey,
    chatWithDocument,
    createConversationTitle,
    summarizePages,
    getMoreQueries,
} from "./lib/openai";

import { closeWindow, minimizeWindow } from "./lib/window";
import Document from "./db/document";
import Collection from "./db/collection";
import Conversation from "./db/conversation";

import syncDatabase from "./db/sync";
import { processPDF } from "./lib/document";
import Message from "./db/message";
import {
    deletePointsForDocumentId,
    ensureCollectionExists,
} from "./lib/qdrant";
import { RAGFusion } from "./lib/rag";

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

ipcMain.handle("chatWithDocument", async (event, messages, documentId) => {
    await chatWithDocument(event, messages, documentId);
});

ipcMain.handle("set-api-key", (event, key) => {
    saveApiKey(key);
});

ipcMain.handle(
    "process-pdf",
    async (
        event: IpcMainEvent,
        pages: string[],
        pdfPath: string,
        bookName: string,
        collectionId: number,
    ) => {
        processPDF({ event, pages, pdfPath, bookName, collectionId });
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
    await ensureCollectionExists();

    const relevantQueries = await getMoreQueries(query, 2);
    const queries = [query, ...relevantQueries];

    const RAGResult = await RAGFusion(queries);
    const document = await Document.findByPk(RAGResult[0].documentId);
    return JSON.parse(
        JSON.stringify({
            content: RAGResult[0].content,
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

        for (let i = 0; i < pages.length; i += 2) {
            const startingPage = i;
            const endingPage = Math.min(pages.length, i + 2);

            lastSummary = await summarizePages(
                event,
                pages.slice(startingPage, endingPage),
                lastSummary,
            );

            writeStream.write("\n\n" + lastSummary);
            console.log(
                `Summarized page ${startingPage}-${endingPage} of ${pages.length}`,
            );
        }

        writeStream.end();
    },
);

app.on("ready", async () => {
    await syncDatabase();

    if (BrowserWindow.getAllWindows().length == 0) {
        const mainWindow = new BrowserWindow({
            width: 1000,
            height: 600,
            titleBarStyle: "hidden",
            transparent: true,
            webPreferences: {
                webSecurity: false,
                preload: path.join(__dirname, "preload.js"),
                nodeIntegration: true,
            },
        });
        ipcMain.handle("close", () => closeWindow(mainWindow));
        ipcMain.handle("minimize", () => minimizeWindow(mainWindow));

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
