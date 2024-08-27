import {
    BrowserWindow,
    contextBridge,
    ipcRenderer,
    IpcRendererEvent,
} from "electron";
import { IMessage } from "shared/types/conversation";
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
    chatWithDocument: (
        messages: IMessage[],
        documentId: number,
        collectionId: number,
    ) =>
        ipcRenderer.invoke(
            "chatWithDocument",
            messages,
            documentId,
            collectionId,
        ),
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
    deleteConversation: (conversationId: number) =>
        ipcRenderer.invoke("deleteConversation", conversationId),
});

contextBridge.exposeInMainWorld("backend", {
    processPdf: (
        pages: string[],
        pdfPath: string,
        bookName: string,
        collectionId: number,
    ) =>
        ipcRenderer.invoke(
            "process-pdf",
            pages,
            pdfPath,
            bookName,
            collectionId,
        ),

    getCollections: () => ipcRenderer.invoke("getCollections"),
    createCollection: (collectionName: string) =>
        ipcRenderer.invoke("createCollection", collectionName),
    getDocument: (documentId: string) =>
        ipcRenderer.invoke("getDocument", documentId),
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
