import { IpcMainInvokeEvent } from "electron";
import { Chunk } from "./qdrant";
import { QdrantClient } from "@qdrant/js-client-rest";
import { TiktokenModel } from "tiktoken";

export interface ProcessChunksData {
    event: IpcMainInvokeEvent;
    chunks: Chunk[];
    client: QdrantClient;
    collectionId: string;
    bookName: string;
    totalChunks: number;
}

export interface IModel {
    openai: string;
    tiktoken: TiktokenModel;
    pricingPer1M: number;
}

export interface IModels {
    embedding: IModel;
    chat: IModel;
}
