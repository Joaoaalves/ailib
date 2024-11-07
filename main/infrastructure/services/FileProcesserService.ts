import ITextChunk from "@domain/entities/TextChunk";
import ITextChunkRepository from "@domain/repositories/TextChunkRepository";
import { IOpenAIService } from "@infra/adapters/OpenAIAdapter";
import { EventEmitterService } from "@infra/events/EventEmmiterService";
import { EventsChannel } from "@infra/events/EventsChannel";

import { IQDrantService, Metadata } from "../adapters/QDrantAdapter";
import { IpcMainEvent } from "electron";
import BaseCreateUseCase from "@application/interfaces/BaseCreateUseCase";

export interface IFileProcesserService {
    processChunks(
        chunks: string[],
        offset: number,
        metadata: Metadata,
        embeddingModel: string,
    ): Promise<void>;
}

export class FileProcesserService implements IFileProcesserService {
    private eventEmitter = EventEmitterService.getInstance();

    constructor(
        private openAIService: IOpenAIService,
        private qdrantService: IQDrantService,
        private createTextChunkUseCase: BaseCreateUseCase<ITextChunk>,
        mainEvent: IpcMainEvent["sender"],
    ) {
        this.eventEmitter.setSender(mainEvent);
    }

    async processChunks(chunks: string[], offset: number, metadata: Metadata) {
        try {
            for (let index = 0; index < chunks.length; index++) {
                const chunk = chunks[index];

                const textChunk = await this.createTextChunkUseCase.execute({
                    text: chunk,
                });

                const chunkParts = this.splitChunkSemantically(chunk, 5);

                const embeddings = await this.embeddChunks(chunkParts);

                this.emitProgress(index, chunks.length);

                await this.upsertChunks(
                    textChunk,
                    embeddings,
                    metadata,
                    offset + index,
                );
            }
        } catch (error) {
            console.error("Error processing chunks:", error);
        }
    }

    private emitProgress(currIndex: number, totalLength: number) {
        return this.eventEmitter.emitProgress(
            EventsChannel.EMBEDDING_PROGRESS,
            ((currIndex + 1) * 100) / totalLength,
        );
    }

    private async embeddChunks(chunks: string[]) {
        return Promise.all(
            chunks.map(async (chunk) => {
                return await this.openAIService.getEmbeddings(chunk);
            }),
        );
    }

    private async upsertChunks(
        textChunk: ITextChunk,
        embeddings: number[][],
        metadata,
        offset,
    ) {
        for (const [partIndex, embedding] of embeddings.entries()) {
            metadata.page = offset;
            metadata.chunkId = textChunk.id;
            await this.qdrantService.upsertEmbedding(embedding, metadata);
        }
    }

    private splitChunkSemantically(chunk: string, parts: number): string[] {
        const sentences = chunk.match(/[^.!?]+[.!?]+/g) || [chunk];
        const totalLength = sentences.reduce(
            (sum, sentence) => sum + sentence.length,
            0,
        );
        const targetPartLength = totalLength / parts;

        const chunkParts = [];
        let currentPart = "";
        let currentLength = 0;

        for (let i = 0; i < sentences.length; i++) {
            const sentence = sentences[i];
            currentPart += sentence;
            currentLength += sentence.length;

            if (
                currentLength >= targetPartLength ||
                (i === sentences.length - 1 && chunkParts.length < parts - 1)
            ) {
                chunkParts.push(currentPart.trim());
                currentPart = "";
                currentLength = 0;
            }
        }

        if (currentPart) {
            chunkParts.push(currentPart.trim());
        }

        while (chunkParts.length < parts) {
            const lastPart = chunkParts.pop()!;
            const splitIndex = Math.floor(lastPart.length / 2);
            chunkParts.push(
                lastPart.slice(0, splitIndex).trim(),
                lastPart.slice(splitIndex).trim(),
            );
        }

        return chunkParts;
    }
}
