import { ITextChunk } from "./document";

export type RankedSearchResult = {
    id: string;
    documentId: string;
    page: number;
    score: number;
    occurrences: number;
    chunkId: number;
};
export interface Chunk {
    text: string;
    offset: number;
}

export type Metadata = {
    collectionId: number;
    bookName?: string;
    page?: number;
    documentId: number;
    chunkId?: number;
};

export type UpsertEmbeddingParams = {
    embedding: number[];
    metadata: Metadata;
};
