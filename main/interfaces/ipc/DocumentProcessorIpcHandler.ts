import { ipcMain, IpcMainEvent } from "electron";

import { TextChunkRepository } from "@application/repositories/TextChunk";
import { SettingRepository } from "@application/repositories/Setting";
import { DocumentRepository } from "@application/repositories/Document";

import { OpenAIService } from "@infra/services/OpenAI";
import { QDrantService } from "@infra/services/QDrant";
import { EventEmitterService } from "@infra/events/EventEmmiterService";

import { OpenAIAdapter } from "@infra/adapters/OpenAI";
import { QDrantAdapter } from "@infra/adapters/QDrant";
import { FileProcesserService } from "@infra/services/FileProcesser";

const documentRepository = new DocumentRepository();
const settingRepository = new SettingRepository();
const textChunkRepository = new TextChunkRepository();

const openAiService = new OpenAIService(
    new OpenAIAdapter(settingRepository),
    settingRepository,
);

const qdrantService = new QDrantService(new QDrantAdapter(settingRepository));

const eventEmitterService = EventEmitterService.getInstance();

ipcMain.handle(
    "processPdf",
    async (
        event: IpcMainEvent,
        pages: string[],
        documentId: number,
        collectionId: number,
        processCount: number,
    ) => {
        const fileProcesserService = new FileProcesserService(
            openAiService,
            qdrantService,
            textChunkRepository,
            event.sender,
        );

        const embeddingModel =
            await settingRepository.findById("embeddingModel");
        const document = await documentRepository.findById(documentId);

        if (!document) {
            return { error: "Document not found!" };
        }

        const totalPages = pages.length;
        const chunkSize = Math.ceil(totalPages / processCount);

        const intervals = [];

        for (let i = 0; i < processCount; i++) {
            const start = i * chunkSize;
            const end = start + chunkSize;
            intervals.push(pages.slice(start, end));
        }

        await Promise.all(
            intervals.map((pages, index) => {
                const offset = index * chunkSize;
                return fileProcesserService.processChunks(
                    pages,
                    offset,
                    {
                        collectionId,
                        bookName: document.name,
                        documentId: document.id,
                    },
                    embeddingModel.value,
                );
            }),
        );

        event.sender.send("embedding-complete");
    },
);
