export interface ITextChunk {
    id: number;
    text: string;
}

export interface ITextChunkRepository {
    create(textChunk: Partial<ITextChunk>): Promise<ITextChunk>;
    findById(chunkId: number): Promise<ITextChunk>;
}
