import { ErrorResponse } from "../shared/types/api";
import { RankedSearchResult } from "shared/types/qdrant";
import { IpcHandler } from "../main/preload";
import { IConversation, IMessage } from "./@types/chat";
import { ICollection } from "./@types/collection";
import { IDocument } from "shared/types/document";
import { ISummary } from "shared/types/summary";
import { IConfig } from "shared/types/config";
import { IChatStatus } from "shared/types/conversation";

interface IProgress {
    chunk: number;
    total: number;
    embedding: string;
}

declare global {
    interface Window {
        ipc: IpcHandler;
        api: {
            document: {
                get: (documentId: string) => Promise<IDocument | null>;
                create: (
                    name: string,
                    path: string,
                    collectionId: number,
                ) => Promise<IDocument>;
                update: (
                    documentId: number,
                    updateFields,
                ) => Promise<IDocument | ErrorResponse>;
                delete: (documentId: number) => void;
                setLastPageRead: (
                    documentId: number,
                    page: number,
                ) => Promise<void>;
            };
            collection: {
                getAll: () => Promise<ICollection[]>;
                create: (collectionName: string) => number;
                update: (
                    collectionId: number,
                    data: ICollection,
                ) => Promise<ICollection>;
                delete: (collectionId: number) => void;
            };
            conversation: {
                getAll: () => Promise<IConversation[]>;
                get: (collectionId: string) => Promise<Conversation>;
                create: (message: IMessage) => Promise<Conversation>;
                delete: (conversationId: number) => void;
                saveMessage: (
                    conversationId: number,
                    message: IMessage,
                ) => Promise<void>;
            };
            search: (query: string) => Promise<DocSearchResult>;
            fileHandler: {
                processPdf: (
                    pages: string[],
                    documentId: number,
                    collectionId: number,
                    processCount: number,
                ) => void;
                saveCover: (
                    documentId: number,
                    cover: ArrayBuffer,
                ) => Promise<IDocument | ErrorResponse>;
            };
            summary: {
                getAll: () => Promise<ISummary[]>;
                get: (id: string) => Promise<ISummary>;
                summarizePages: (
                    documentId: number,
                    pages: string[],
                    summaryTitle: string,
                ) => void;
                summaryzingProgress: (
                    callback: (data) => void,
                    onEnd: () => void,
                ) => void;
            };
            config: {
                getAll: () => Promise<IConfig[]>;
                update: (key: string, value: string) => Promise<IConfig>;
            };
            openai: {
                embeddingCost: (callback: (cost: number) => void) => void;
                embeddingProgress: (
                    callback: (progress: IProgress) => void,
                    onEnd: () => void,
                ) => void;
                chatWithCollection: (
                    messages: IMessage[],
                    collectionId: string,
                ) => Promise<void>;
                chatWithDocument: (
                    messages: IMessage[],
                    documentId: string,
                ) => Promise<void>;
                onChatStream: (
                    callback: (chunk: any) => void,
                    streamFile: (result: RankedSearchResult) => void,
                    onEnd: () => void,
                ) => void;
                onChatStatus: (
                    callback: (chatStatus: IChatStatus) => void,
                ) => void;
            };
        };

        actions: {
            close: () => void;
            minimize: () => void;
        };
    }
}
