import { ipcMain } from "electron";

import { DocumentRepositorySequelize } from "@infra/database/adapters/DocumentRepository";
import { SettingRepositorySequelize } from "@infra/database/adapters/SettingRepository";
import { TextChunkRepositorySequelize } from "@infra/database/adapters/TextChunkRepository";

import { OpenAIAdapter } from "../../infrastructure/adapters/OpenAIAdapter";
import { OpenAIService } from "../../infrastructure/services/OpenAIService";
import { RAGService } from "../../infrastructure/services/RAGService";
import { FormatResponseService } from "../../infrastructure/services/FormatResponseService";
import { QDrantService } from "../../infrastructure/services/QDrantService";

import { QDrantAdapter } from "../../infrastructure/adapters/QDrantAdapter";

const documentRepository = new DocumentRepositorySequelize();
const textChunkRepository = new TextChunkRepositorySequelize();
const settingRepository = new SettingRepositorySequelize();

const openAIService = new OpenAIService(
    new OpenAIAdapter(settingRepository),
    settingRepository,
);

const qdrantService = new QDrantService(new QDrantAdapter(settingRepository));

const ragService = new RAGService(openAIService, qdrantService);

ipcMain.handle("search", async (event, query) => {
    const embeddingModel = await settingRepository.findById("embeddingModel");
    const sqrModel = await settingRepository.findById(
        "selfQueryRetrievalModel",
    );
    const relevantQueries = await ragService.generateQueries(
        query,
        sqrModel.value,
    );

    const queries = [query, ...relevantQueries];

    const embeddedQueries = await Promise.all(
        queries.map((query) =>
            openAIService.getEmbeddings(query, embeddingModel.value),
        ),
    );

    const RAGResult = await ragService.RAGFusion(embeddedQueries);

    const document = await documentRepository.findById(
        parseInt(RAGResult[0].documentId),
    );

    const textChunk = await textChunkRepository.findById(RAGResult[0].chunkId);

    return FormatResponseService.formatToJson({
        content: textChunk.text,
        page: RAGResult[0].page,
        document,
    });
});
