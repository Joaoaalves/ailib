import { ITextChunk } from "@entities/TextChunk";
import { TextChunkRepository } from "@repositories/TextChunk";
export class TextChunkService {
    constructor(private textChunkRepository: TextChunkRepository) {}

    async create(textChunk: Partial<ITextChunk>) {
        return this.textChunkRepository.create(textChunk);
    }

    async findById(chunkId: number) {
        return this.textChunkRepository.findById(chunkId);
    }
}
