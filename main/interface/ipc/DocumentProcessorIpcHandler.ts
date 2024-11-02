import { ipcMain, IpcMainEvent } from "electron";

import { TextChunkRepositorySequelize } from "@infra/database/adapters/TextChunkRepository";
import { SettingRepositorySequelize } from "@infra/database/adapters/SettingRepository";
import { DocumentRepositorySequelize } from "@infra/database/adapters/DocumentRepository";

import { OpenAIService } from "@infra/services/OpenAIService";
import { QDrantService } from "@infra/services/QDrantService";
import { EventEmitterService } from "@infra/events/EventEmmiterService";

import { OpenAIAdapter } from "@infra/adapters/OpenAIAdapter";
import { QDrantAdapter } from "@infra/adapters/QDrantAdapter";
import { FileProcesserService } from "@infra/services/FileProcesser";

const documentRepository = new DocumentRepositorySequelize();
const settingRepository = new SettingRepositorySequelize();
const textChunkRepository = new TextChunkRepositorySequelize();

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
