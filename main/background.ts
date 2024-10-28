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

import syncDatabase from "./db/sync";
import { processPDF } from "./lib/document";
import { ensureCollectionsExists } from "./lib/qdrant";

import { RAGFusion } from "./lib/rag";
import { saveCoverOnStorage, savePdfToStorage } from "./lib/file";
import { IDocument } from "shared/types/document";
import Config from "./db/config";
import createDefaultConfigsIfNotExists from "./helpers/defaultConfigs";
import TextChunk from "./db/textChunk";

import { CollectionService } from "@services/Collection";
import { DocumentService } from "@services/Document";
import { SummaryService } from "@services/Summary";

import { FormatResponseService } from "@services/FormatResponse/format-response-json";
import { CreateConversationService } from "@services/Conversations/create-conversation";
import { DeleteConversationService } from "@services/Conversations/delete-conversation";
import { AddMessageToConversationService } from "@services/Conversations/add-message-to-conversation";
import { FindConversationByIdService } from "./application/services/Conversations/find-conversation-by-id";
import { FindAllConversationsService } from "./application/services/Conversations/find-all-conversations";
import { GetConversationMessagesService } from "./application/services/Conversations/get-conversation-messages";

import { CollectionRepository } from "@repositories/Collection";
import { DocumentRepository } from "@repositories/Document";
import { SummaryRepository } from "@repositories/Summary";
import { CreateConversationRepository } from "@repositories/Conversation/create-conversation";
import { GetConversationMessagesRepository } from "@repositories/Conversation/get-conversation-messages";
import { FindAllConversationsRepository } from "@repositories/Conversation/find-all-conversations";
import { FindConversationByIdRepository } from "@repositories/Conversation/find-conversation-by-id";
import { AddMessageToConversationRepository } from "@repositories/Conversation/add-message-to-conversation";
import { DeleteConversationRepository } from "@repositories/Conversation/delete-conversation";

import Document from "@models/Document";

const isProd = process.env.NODE_ENV === "production";
// Create a new Collection
ipcMain.handle("createCollection", async (event, collectionName: string) => {
    const collectionService = new CollectionService(new CollectionRepository());

    const collection = await collectionService.createCollection({
        name: collectionName,
    });
    return FormatResponseService.formatToJson(collection);
});

// List all Collections
ipcMain.handle("getCollections", async (event) => {
    const collectionService = new CollectionService(new CollectionRepository());

    const collections = await collectionService.getAllCollections();
    return FormatResponseService.formatToJson(collections);
});

// Update Collection
ipcMain.handle("updateCollection", async (event, collectionId, data) => {
    const collectionService = new CollectionService(new CollectionRepository());

    await collectionService.updateCollection(collectionId, data);
    return FormatResponseService.formatToJson(data);
});

// Delete Collection
ipcMain.handle("deleteCollection", async (event, collectionId) => {
    const collectionService = new CollectionService(new CollectionRepository());

    await collectionService.deleteCollection(collectionId);
    return FormatResponseService.formatToJson({ collectionId });
});

// Create Document
ipcMain.handle(
    "createDocument",
    async (
        event: IpcMainEvent,
        name: string,
        path: string,
        collectionId: number,
    ) => {
        const storagePdfPath = await savePdfToStorage(path, name);
        const documentService = new DocumentService(new DocumentRepository());

        const document = await documentService.create({
            name,
            path: storagePdfPath,
        });

        if (document) {
            const collectionService = new CollectionService(
                new CollectionRepository(),
            );
            await collectionService.addDocument(collectionId, document.id);

            return FormatResponseService.formatToJson(document);
        }

        return FormatResponseService.formatToJson({
            error: "Failed to create document.",
        });
    },
);

// Update Document
ipcMain.handle(
    "updateDocument",
    async (
        event: IpcMainEvent,
        documentId: number,
        updateFields: IDocument,
    ) => {
        const documentService = new DocumentService(new DocumentRepository());

        await documentService.update(documentId, updateFields);
        return FormatResponseService.formatToJson(updateFields);
    },
);

// Get Document
ipcMain.handle("getDocument", async (event, documentId) => {
    const documentService = new DocumentService(new DocumentRepository());

    const doc = await documentService.findById(documentId);
    return FormatResponseService.formatToJson(doc);
});

// Delete Document
ipcMain.handle("deleteDocument", async (event, documentId) => {
    const documentService = new DocumentService(new DocumentRepository());

    return await documentService.delete(documentId);
});

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
            return FormatResponseService.formatToJson(doc);
        }

        return {
            error: "Document not found!",
        };
    },
);

// Create Conversation
ipcMain.handle("createConversation", async (event, message) => {
    const title = await createConversationTitle(message);

    const createConversationService = new CreateConversationService(
        new CreateConversationRepository(),
    );
    const conversation = createConversationService.create({ title });

    return FormatResponseService.formatToJson(conversation);
});

// Get Conversation with Messages
ipcMain.handle("getConversationMessages", async (event, conversationId) => {
    const getConversationMessagesService = new GetConversationMessagesService(
        new GetConversationMessagesRepository(),
    );
    const conversation =
        await getConversationMessagesService.getMessages(conversationId);

    return FormatResponseService.formatToJson(conversation);
});

// Get All Conversations
ipcMain.handle("getConversations", async (event) => {
    const findAllConversationsService = new FindAllConversationsService(
        new FindAllConversationsRepository(),
    );

    const conversations = await findAllConversationsService.findAll();
    return FormatResponseService.formatToJson(conversations);
});

// Save Message to Conversation
ipcMain.handle("saveMessage", async (event, conversationId, message) => {
    try {
        const findConversationByIdService = new FindConversationByIdService(
            new FindConversationByIdRepository(),
        );

        const conversation =
            await findConversationByIdService.findById(conversationId);

        if (conversation) {
            const createConversationService = new CreateConversationService(
                new CreateConversationRepository(),
            );

            const createdMessage =
                await createConversationService.create(message);

            const addMessageToConversationService =
                new AddMessageToConversationService(
                    new AddMessageToConversationRepository(),
                );

            await addMessageToConversationService.addMessage(
                conversationId,
                createdMessage.id,
            );

            return FormatResponseService.formatToJson(createdMessage);
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

ipcMain.handle("deleteConversation", async (event, conversationId) => {
    const deleteConversationService = new DeleteConversationService(
        new DeleteConversationRepository(),
    );

    await deleteConversationService.delete(conversationId);
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

        const summaryService = new SummaryService(new SummaryRepository());

        const summary = await summaryService.create({
            title: summaryTitle,
            path: outputPath,
            summaryType: "interval",
        });

        const documentService = new DocumentService(new DocumentRepository());

        await documentService.addSummary(documentId, summary.id);

        event.sender.send("summaryzingComplete");
        return FormatResponseService.formatToJson(summary);
    },
);

ipcMain.handle("getSummaries", async (event) => {
    const summaryService = new SummaryService(new SummaryRepository());

    return FormatResponseService.formatToJson(await summaryService.findAll());
});

ipcMain.handle("getSummaryById", async (event, id) => {
    try {
        const summaryService = new SummaryService(new SummaryRepository());
        const summary = await summaryService.findById(id);

        if (summary) {
            const data = readFileSync(summary.path, "utf-8");
            summary.text = data;
            return FormatResponseService.formatToJson(summary);
        }

        return FormatResponseService.formatToJson({
            error: "Summary Not Found!",
        });
    } catch (error) {
        return FormatResponseService.formatToJson({
            error: "Error looking for Summary File.",
        });
    }
});

ipcMain.handle("updateConfig", async (event, id, value) => {
    try {
        const config = await Config.findByPk(id);

        if (config) {
            config.value = value;
            await config.save();
            return FormatResponseService.formatToJson(config);
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

        return FormatResponseService.formatToJson(configs);
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
