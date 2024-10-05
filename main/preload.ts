import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { ICollection } from "shared/types/collection";
import { IChatStatus, IMessage } from "shared/types/conversation";
import { IDocument } from "shared/types/document";
import { RankedSearchResult } from "shared/types/qdrant";

const handler = {
    send(channel: string, value: unknown) {
        ipcRenderer.send(channel, value);
    },
    on(channel: string, callback: (...args: unknown[]) => void) {
        const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
            callback(...args);
        ipcRenderer.on(channel, subscription);

        return () => {
            ipcRenderer.removeListener(channel, subscription);
        };
    },
};

contextBridge.exposeInMainWorld("ipc", handler);

contextBridge.exposeInMainWorld("api", {
    document: {
        create: async (name: string, path: string, collectionId: number) =>
            ipcRenderer.invoke("createDocument", name, path, collectionId),
        get: (documentId: string) =>
            ipcRenderer.invoke("getDocument", documentId),
        update: async (documentId: number, updateFields: IDocument) =>
            ipcRenderer.invoke("updateDocument", documentId, updateFields),
        delete: (documentId: number) =>
            ipcRenderer.invoke("deleteDocument", documentId),
        setLastPageRead: (documentId: number, page: number) =>
            ipcRenderer.invoke("setLastPageReadSave", documentId, page),
    },
    collection: {
        getAll: () => ipcRenderer.invoke("getCollections"),
        create: (collectionName: string) =>
            ipcRenderer.invoke("createCollection", collectionName),
        update: (collectionId: number, data: ICollection) =>
            ipcRenderer.invoke("updateCollection", collectionId, data),
        delete: async (collectionId: number) =>
            ipcRenderer.invoke("deleteCollection", collectionId),
        saveMessage: (conversationId: number, message: IMessage) =>
            ipcRenderer.invoke("saveMessage", conversationId, message),
    },
    conversation: {
        get: (conversationId: number) =>
            ipcRenderer.invoke("getConversationMessages", conversationId),
        getAll: () => ipcRenderer.invoke("getConversations"),
        create: (message: IMessage) =>
            ipcRenderer.invoke("createConversation", message),
        delete: (conversationId: number) =>
            ipcRenderer.invoke("deleteConversation", conversationId),
        saveMessage: (conversationId: number, message: IMessage) =>
            ipcRenderer.invoke("saveMessage", conversationId, message),
    },
    fileHandler: {
        processPdf: (
            pages: string[],
            documentId: number,
            collectionId: number,
            processCount: number,
        ) =>
            ipcRenderer.invoke(
                "processPdf",
                pages,
                documentId,
                collectionId,
                processCount,
            ),
        saveCover: async (documentId: number, cover: ArrayBuffer) =>
            ipcRenderer.invoke("saveCover", documentId, cover),
    },
    config: {
        getAll: () => ipcRenderer.invoke("getConfigs"),
        update: (key: string, value: string) =>
            ipcRenderer.invoke("updateConfig", key, value),
    },
    summary: {
        getAll: async () => ipcRenderer.invoke("getSummaries"),
        get: async (id: number) => ipcRenderer.invoke("getSummaryById", id),
        summarizePages: (
            documentId: number,
            pages: string[],
            summaryTitle: string,
        ) =>
            ipcRenderer.invoke(
                "summarizePages",
                documentId,
                pages,
                summaryTitle,
            ),
        summaryzingProgress: (
            callback: (progress: number) => void,
            onEnd: () => void,
        ) => {
            ipcRenderer.on("summaryzingProgress", (event, progress) =>
                callback(progress),
            );
            ipcRenderer.on("summaryzingComplete", onEnd);
        },
    },
    search: (query: string) => ipcRenderer.invoke("search", query),
    openai: {
        embeddingCost: (callback: (cost: number) => void) =>
            ipcRenderer.on("embedding_cost", (event, cost) => callback(cost)),
        embeddingProgress: (
            callback: (progress: any) => void,
            onEnd: () => void,
        ) => {
            ipcRenderer.on("embedding_progress", (event, progress) =>
                callback(progress),
            );
            ipcRenderer.on("embedding_complete", onEnd);
        },
        chatWithCollection: (messages: IMessage[], collectionId: number) =>
            ipcRenderer.invoke("chatWithCollection", messages, collectionId),
        chatWithDocument: (messages: IMessage[], documentId: number) =>
            ipcRenderer.invoke("chatWithDocument", messages, documentId),
        onChatStream: (
            callback: (chunk: any) => void,
            streamFile: (result: RankedSearchResult) => void,
            onEnd: () => void,
        ) => {
            ipcRenderer.on("chat-stream", (event, chunk) => callback(chunk));
            ipcRenderer.on("chat-stream-files", (event, result) =>
                streamFile(result),
            );
            ipcRenderer.on("chat-stream-end", onEnd);
        },
        onChatStatus: (callback: (chatStatus: IChatStatus) => void) => {
            ipcRenderer.on("chat-status", (event, chatStatus) =>
                callback(chatStatus),
            );
        },
    },
});

contextBridge.exposeInMainWorld("actions", {
    close: () => ipcRenderer.invoke("close"),
    minimize: () => ipcRenderer.invoke("minimize"),
});

export type IpcHandler = typeof handler;
