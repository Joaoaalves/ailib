import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { ICollection } from "shared/types/collection";
import { IMessage } from "shared/types/conversation";
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

contextBridge.exposeInMainWorld("summary", {
    get: async () => ipcRenderer.invoke("getSummaries"),
    getById: async (id: number) => ipcRenderer.invoke("getSummaryById", id),
});

contextBridge.exposeInMainWorld("openai", {
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
    summarizePages: (
        documentId: number,
        pages: string[],
        summaryTitle: string,
    ) => ipcRenderer.invoke("summarizePages", documentId, pages, summaryTitle),
    summaryzingProgress: (
        callback: (progress: number) => void,
        onEnd: () => void,
    ) => {
        ipcRenderer.on("summaryzingProgress", (event, progress) =>
            callback(progress),
        );
        ipcRenderer.on("summaryzingComplete", onEnd);
    },
    deleteConversation: (conversationId: number) =>
        ipcRenderer.invoke("deleteConversation", conversationId),
});

contextBridge.exposeInMainWorld("backend", {
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
    getDocument: (documentId: string) =>
        ipcRenderer.invoke("getDocument", documentId),
    createDocument: async (name: string, path: string, collectionId: number) =>
        ipcRenderer.invoke("createDocument", name, path, collectionId),
    saveCover: async (documentId: number, cover: ArrayBuffer) =>
        ipcRenderer.invoke("saveCover", documentId, cover),
    updateDocument: async (documentId: number, updateFields: IDocument) =>
        ipcRenderer.invoke("updateDocument", documentId, updateFields),
    getCollections: () => ipcRenderer.invoke("getCollections"),
    createCollection: (collectionName: string) =>
        ipcRenderer.invoke("createCollection", collectionName),
    updateCollection: (collectionId: number, data: ICollection) =>
        ipcRenderer.invoke("updateCollection", collectionId, data),
    deleteCollection: async (collectionId: number) =>
        ipcRenderer.invoke("deleteCollection", collectionId),
    setLastPageRead: (documentId: number, page: number) =>
        ipcRenderer.invoke("setLastPageReadSave", documentId, page),
    deleteDocument: (documentId: number) =>
        ipcRenderer.invoke("deleteDocument", documentId),
    createConversation: (message: IMessage) =>
        ipcRenderer.invoke("createConversation", message),
    getConversation: (conversationId: number) =>
        ipcRenderer.invoke("getConversationMessages", conversationId),
    getConversations: () => ipcRenderer.invoke("getConversations"),
    saveMessage: (conversationId: number, message: IMessage) =>
        ipcRenderer.invoke("saveMessage", conversationId, message),
    search: (query: string) => ipcRenderer.invoke("search", query),
});

contextBridge.exposeInMainWorld("actions", {
    close: () => ipcRenderer.invoke("close"),
    minimize: () => ipcRenderer.invoke("minimize"),
});

contextBridge.exposeInMainWorld("openai", {
    setApiKey: (apiKey: string) => ipcRenderer.invoke("set-api-key", apiKey),
});

export type IpcHandler = typeof handler;
