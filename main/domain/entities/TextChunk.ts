import { IRepository } from "./Repository";

export interface ITextChunk {
    id: number;
    text: string;
}

export interface ITextChunkRepository extends IRepository<ITextChunk> {}
