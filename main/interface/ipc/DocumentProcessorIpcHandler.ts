import { ipcMain, IpcMainEvent } from "electron";

import GetDocumentUseCase from "@application/usecases/Document/GetDocumentUseCase";

import { TextChunkRepositorySequelize } from "@infra/database/adapters/TextChunkRepository";
import { SettingRepositorySequelize } from "@infra/database/adapters/SettingRepository";
import { DocumentRepositorySequelize } from "@infra/database/adapters/DocumentRepository";

import { OpenAIService } from "@infra/services/OpenAIService";
import { QDrantService } from "@infra/services/QDrantService";

import { OpenAIAdapter } from "@infra/adapters/OpenAIAdapter";
import { QDrantAdapter } from "@infra/adapters/QDrantAdapter";
import { FileProcesserService } from "@infra/services/FileProcesserService";
import CreateTextChunkUseCase from "@application/usecases/TextChunk/CreateTextChunkUseCase";
import { SettingService } from "@infra/services/SettingService";

const documentRepository = new DocumentRepositorySequelize();
const settingRepository = new SettingRepositorySequelize();
const textChunkRepository = new TextChunkRepositorySequelize();

const getDocumentUseCase = new GetDocumentUseCase(documentRepository);

const settingService = new SettingService(settingRepository);
const qdrantService = new QDrantService(new QDrantAdapter(settingService));

ipcMain.handle(
    "processPdf",
    async (
        event: IpcMainEvent,
        pages: string[],
        documentId: number,
        collectionId: number,
        processCount: number,
    ) => {
        const openAiApiKey = await settingService.getOpenAIApiKey();
        const embeddingModel = await settingService.getEmbeddingModel();

        const openAIAdapter = new OpenAIAdapter(openAiApiKey);
        openAIAdapter.setEmbeddingModel(embeddingModel);

        const openAiService = new OpenAIService(openAIAdapter, settingService);

        const fileProcesserService = new FileProcesserService(
            openAiService,
            qdrantService,
            new CreateTextChunkUseCase(textChunkRepository),
            event.sender,
        );

        const document = await getDocumentUseCase.execute(documentId);

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
                return fileProcesserService.processChunks(pages, offset, {
                    collectionId,
                    bookName: document.name,
                    documentId: document.id,
                });
            }),
        );

        event.sender.send("embedding-complete");
    },
);
