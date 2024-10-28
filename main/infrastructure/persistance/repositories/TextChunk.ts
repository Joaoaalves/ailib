import { ITextChunk, ITextChunkRepository } from "@entities/TextChunk";
import TextChunk from "@models/TextChunk";
import { mapToEntity } from "../utils/mapToEntity";

export class TextChunkRepository implements ITextChunkRepository {
    async create(textChunk: Partial<ITextChunk>): Promise<ITextChunk> {
        const chunk = await TextChunk.create(textChunk);
        return mapToEntity<ITextChunk>(chunk);
    }

    async findById(chunkId: number): Promise<ITextChunk> {
        const chunk = await TextChunk.findByPk(chunkId);
        return mapToEntity<ITextChunk>(chunk);
    }
}
