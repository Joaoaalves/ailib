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

import Conversation from "./db/conversation";

import syncDatabase from "./db/sync";
import { processPDF } from "./lib/document";
import Message from "./db/message";
import { ensureCollectionsExists } from "./lib/qdrant";

import { RAGFusion } from "./lib/rag";
import { saveCoverOnStorage, savePdfToStorage } from "./lib/file";
import { IDocument } from "shared/types/document";
import Config from "./db/config";
import createDefaultConfigsIfNotExists from "./helpers/defaultConfigs";
import TextChunk from "./db/textChunk";

import { CreateDocumentService } from "@services/Document/create-document";
import { UpdateDocumentService } from "@services/Document/update-document";
import { FindDocumentByIdService } from "@services/Document/find-document-by-id";
import { CreateCollectionService } from "./application/services/Collection/create-collection";
import { FindAllCollectionsService } from "@services/Collection/find-all-collections";
import { UpdateCollectionService } from "@services/Collection/update-collection";
import { DeleteCollectionService } from "@services/Collection/delete-collection";
import { FormatResponseService } from "@services/FormatResponse/format-response-json";
import { AddSummaryToDocumentService } from "./application/services/Document/add-summary-to-document";
import { DeleteDocumentService } from "./application/services/Document/delete-document";
import { CreateSummaryService } from "@services/Summary/create-summary";
import { FindAllSummarysService } from "@services/Summary/find-all-summarys";
import { FindSummaryByIdService } from "@services/Summary/find-summary-by-id";

import { FindAllSummarysRepository } from "@repositories/Summary/find-all-summarys";
import { FindSummaryByIdRepository } from "@repositories/Summary/find-summary-by-id";
import { CreateSummaryRepository } from "./infrastructure/persistance/repositories/Summary/create-summary";
import { CreateDocumentRepository } from "@repositories/Document/create-document";
import { AddDocumentToCollectionRepository } from "@repositories/Collection/add-document-to-collection";
import { UpdateDocumentRepository } from "@repositories/Document/update-document";
import { FindDocumentByIdRepository } from "@repositories/Document/find-document-by-id";
import { DeleteDocumentRepository } from "@repositories/Document/delete-document";
import { UpdateCollectionRepository } from "@repositories/Collection/update-collection";
import { DeleteCollectionRepository } from "./infrastructure/persistance/repositories/Collection/delete-collection";
import { FindAllCollectionsRepository } from "./infrastructure/persistance/repositories/Collection/find-all-collections";
import { CreateCollectionRepository } from "@repositories/Collection/create-collection";

import Document from "@models/Document";

const isProd = process.env.NODE_ENV === "production";
// Create a new Collection
ipcMain.handle("createCollection", async (event, collectionName: string) => {
    const createCollectionRepository = new CreateCollectionRepository();
    const createCollectionService = new CreateCollectionService(
        createCollectionRepository,
    );

    const collection = await createCollectionService.createCollection({
        name: collectionName,
    });
    return FormatResponseService.formatToJson(collection);
});

// List all Collections
ipcMain.handle("getCollections", async (event) => {
    const findAllCollectionsRepository = new FindAllCollectionsRepository();
    const findAllCollectionsService = new FindAllCollectionsService(
        findAllCollectionsRepository,
    );

    const collections = await findAllCollectionsService.getAllCollections();
    return FormatResponseService.formatToJson(collections);
});

// Update Collection
ipcMain.handle("updateCollection", async (event, collectionId, data) => {
    const updateCollectionRepository = new UpdateCollectionRepository();
    const updateCollectionService = new UpdateCollectionService(
        updateCollectionRepository,
    );

    await updateCollectionService.updateCollection(collectionId, data);
    return FormatResponseService.formatToJson(data);
});

// Delete Collection
ipcMain.handle("deleteCollection", async (event, collectionId) => {
    const deleteCollectionRepository = new DeleteCollectionRepository();
    const deleteCollectionService = new DeleteCollectionService(
        deleteCollectionRepository,
    );

    await deleteCollectionService.deleteCollection(collectionId);
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

        const createDocumentRepository = new CreateDocumentRepository();
        const createDocumentService = new CreateDocumentService(
            createDocumentRepository,
        );

        const document = await createDocumentService.create({
            name,
            path: storagePdfPath,
        });

        if (document) {
            const addDocumentToCollectionRepository =
                new AddDocumentToCollectionRepository();
            await addDocumentToCollectionRepository.addDocument(
                collectionId,
                document.id,
            );

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
        const updateDocumentRepository = new UpdateDocumentRepository();
        const updateDocumentService = new UpdateDocumentService(
            updateDocumentRepository,
        );

        await updateDocumentService.update(documentId, updateFields);
        return FormatResponseService.formatToJson(updateFields);
    },
);

ipcMain.handle("getDocument", async (event, documentId) => {
    const findDocumentByIdRepository = new FindDocumentByIdRepository();
    const findDocumentByIdService = new FindDocumentByIdService(
        findDocumentByIdRepository,
    );

    const doc = await findDocumentByIdService.findById(documentId);
    return FormatResponseService.formatToJson(doc);
});

ipcMain.handle("deleteDocument", async (event, documentId) => {
    const deleteDocumentRepository = new DeleteDocumentRepository();
    const deleteDocumentService = new DeleteDocumentService(
        deleteDocumentRepository,
    );

    return await deleteDocumentService.delete(documentId);
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

ipcMain.handle("createConversation", async (event, message) => {
    const title = await createConversationTitle(message);
    const conversation = await Conversation.create({ title });
    return FormatResponseService.formatToJson(conversation);
});

ipcMain.handle("getConversationMessages", async (event, conversationId) => {
    const conversation = await Conversation.findByPk(conversationId, {
        include: Message,
        order: [["id", "ASC"]],
    });
    return FormatResponseService.formatToJson(conversation);
});

ipcMain.handle("getConversations", async (event) => {
    const conversations = await Conversation.findAll();
    return FormatResponseService.formatToJson(conversations);
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

        const createSummaryService = new CreateSummaryService(
            new CreateSummaryRepository(),
        );

        const summary = await createSummaryService.create({
            title: summaryTitle,
            path: outputPath,
            summaryType: "interval",
        });

        const addDocumentToSummaryService = new AddSummaryToDocumentService(
            new AddDocumentToCollectionRepository(),
        );

        await addDocumentToSummaryService.addSummary(documentId, summary.id);

        event.sender.send("summaryzingComplete");
        return FormatResponseService.formatToJson(summary);
    },
);

ipcMain.handle("getSummaries", async (event) => {
    const findAllSummarysService = new FindAllSummarysService(
        new FindAllSummarysRepository(),
    );

    return FormatResponseService.formatToJson(
        await findAllSummarysService.findAll(),
    );
});

ipcMain.handle("getSummaryById", async (event, id) => {
    try {
        const findSummaryByIdService = new FindSummaryByIdService(
            new FindSummaryByIdRepository(),
        );
        const summary = await findSummaryByIdService.findById(id);

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
