import ITextChunkRepository from '@domain/repositories/TextChunkRepository';
import ITextChunk from "@domain/entities/TextChunk";
import TextChunkModel from "@infra/database/models/TextChunkModel";
import { mapToEntity } from "@infra/utils/mapToEntity";

export class TextChunkRepository implements ITextChunkRepository {
    async create(textChunk: Partial<ITextChunk>): Promise<ITextChunk> {
        const chunk = await TextChunkModel.create(textChunk);
        return mapToEntity<ITextChunk>(chunk);
    }

    async findById(chunkId: number): Promise<ITextChunk> {
        const chunk = await TextChunkModel.findByPk(chunkId);
        return mapToEntity<ITextChunk>(chunk);
    }

    async findAll(filter?: object): Promise<ITextChunk[]> {
        const chunks = await TextChunkModel.findAll(filter);

        return chunks.map((chunk) => mapToEntity<ITextChunk>(chunk));
    }
}
