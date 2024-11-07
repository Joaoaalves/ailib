import GetDocumentUseCase from "@application/usecases/Document/GetDocumentUseCase";
import { ipcMain } from "electron";

import { DocumentRepositorySequelize } from "@infra/database/adapters/DocumentRepository";
import { SettingRepositorySequelize } from "@infra/database/adapters/SettingRepository";
import { TextChunkRepositorySequelize } from "@infra/database/adapters/TextChunkRepository";

import { OpenAIAdapter } from "@infra/adapters/OpenAIAdapter";
import { OpenAIService } from "@infra/services/OpenAIService";
import { RAGService } from "@infra/services/RAGService";
import { FormatResponseService } from "@infra/services/FormatResponseService";
import { QDrantService } from "@infra/services/QDrantService";

import { QDrantAdapter } from "@infra/adapters/QDrantAdapter";
import GetTextChunkUseCase from "@application/usecases/TextChunk/GetTextChunkUseCase";
import { SettingService } from "@infra/services/SettingService";

const documentRepository = new DocumentRepositorySequelize();
const textChunkRepository = new TextChunkRepositorySequelize();
const settingRepository = new SettingRepositorySequelize();

const settingService = new SettingService(settingRepository);

const qdrantService = new QDrantService(new QDrantAdapter(settingService));

const getDocumentUseCase = new GetDocumentUseCase(documentRepository);

const getTextChunkUseCase = new GetTextChunkUseCase(textChunkRepository);

ipcMain.handle("search", async (event, query) => {
    const openAiApiKey = await settingService.getOpenAIApiKey();
    const embeddingModel = await settingService.getEmbeddingModel();

    const openAiAdapter = new OpenAIAdapter(openAiApiKey);
    openAiAdapter.setEmbeddingModel(embeddingModel);

    const openAIService = new OpenAIService(
        new OpenAIAdapter(openAiApiKey),
        settingService,
    );

    const ragService = new RAGService(
        openAIService,
        qdrantService,
        settingService,
    );

    const relevantQueries = await ragService.generateQueries(query);

    const queries = [query, ...relevantQueries];

    const embeddedQueries = await Promise.all(
        queries.map((query) => openAIService.getEmbeddings(query)),
    );

    const RAGResult = await ragService.RAGFusion(embeddedQueries);

    const document = await getDocumentUseCase.execute(
        parseInt(RAGResult[0].documentId),
    );

    const textChunk = await getTextChunkUseCase.execute(RAGResult[0].chunkId);

    return FormatResponseService.formatToJson({
        content: textChunk.text,
        page: RAGResult[0].page,
        document,
    });
});
