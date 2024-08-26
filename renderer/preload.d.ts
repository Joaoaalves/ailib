import { RankedSearchResult } from "shared/types/qdrant";
import { IpcHandler } from "../main/preload";
import { IConversation, IMessage } from "./@types/chat";
import { ICollection } from "./@types/collection";

interface IProgress {
    chunk: number;
    total: number;
    embedding: string;
}
  

declare global {
    interface Window {
        ipc: IpcHandler;
        openai: {
            embeddingCost: (callback: (cost:number) => void) => void;
            embeddingProgress: (callback: (progress: IProgress) => void, onEnd: () => void) => void;
            chatWithDocument: (messages: IMessage[], documentId: string) => Promise<void>;
            onChatStream: (callback: (chunk: any) => void, streamFile: (result: RankedSearchResult) => void, onEnd: () => void) => void;
            deleteConversation: (conversationId: number) => void;
            summarizePages: (documentId: number, pages:string[], summaryTitle: string) => void;
        },
        backend: {
            processPdf: (
                pages: string[],
                pdfPath: string,
                bookName: string,
                collectionId: number,
            ) => void;
            getCollections: () => Promise<ICollection[]>;
            createCollection: (collectionName: string) => number;
            getDocument: (documentId: string) => Promise<IDocument | null>;
            deleteDocument: (documentId: number) => void;
            createConversation: (message:IMessage) => Promise<Conversation>;
            getConversations: () => Promise<IConversation[]>;
            getConversation: (collectionId: string) => Promise<Conversation>;
            saveMessage: (conversationId: number, message:IMessage) => Promise<void>;
            setLastPageRead: (documentId: number, page: number) => Promise<void>;
        };
        windowAction: {
            close: () => void;
            minimize: () => void;
        };
        openai: {
            setApiKey: (apiKey: string) => void;
        };
    }
}
