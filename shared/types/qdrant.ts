export type RankedSearchResult = {
    id: string;
    content: string;
    bookName: string;
    page: number;
    score: number;
    occurrences: number;
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
};

export type UpsertEmbeddingParams = {
    embedding: number[];
    chunk: string;
    metadata: Metadata;
};
