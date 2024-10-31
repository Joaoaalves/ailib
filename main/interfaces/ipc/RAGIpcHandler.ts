import { ipcMain } from "electron";

import { DocumentRepository } from "@application/repositories/DocumentRepository.";
import { SettingRepository } from "@application/repositories/SettingRepository.";
import { TextChunkRepository } from "@application/repositories/TextChunkRepository.";

import { OpenAIAdapter } from "../../infrastructure/adapters/OpenAIAdapter";
import { OpenAIService } from "../../infrastructure/services/OpenAI";
import { RAGService } from "../../infrastructure/services/RAG";
import { FormatResponseService } from "@application/services/FormatResponse";
import { QDrantService } from "../../infrastructure/services/QDrant";

import { QDrantAdapter } from "../../infrastructure/adapters/QDrantAdapter";

const documentRepository = new DocumentRepository();
const textChunkRepository = new TextChunkRepository();
const settingRepository = new SettingRepository();

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
