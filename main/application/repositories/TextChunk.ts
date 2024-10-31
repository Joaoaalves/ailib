import { ITextChunk, ITextChunkRepository } from "@domain/entities/TextChunk";
import TextChunk from "@domain/models/TextChunk";
import { mapToEntity } from "@infra/utils/mapToEntity";

export class TextChunkRepository implements ITextChunkRepository {
    async create(textChunk: Partial<ITextChunk>): Promise<ITextChunk> {
        const chunk = await TextChunk.create(textChunk);
        return mapToEntity<ITextChunk>(chunk);
    }

    async findById(chunkId: number): Promise<ITextChunk> {
        const chunk = await TextChunk.findByPk(chunkId);
        return mapToEntity<ITextChunk>(chunk);
    }

    async findAll(filter?: object): Promise<ITextChunk[]> {
        const chunks = await TextChunk.findAll(filter);

        return chunks.map((chunk) => mapToEntity<ITextChunk>(chunk));
    }
}
