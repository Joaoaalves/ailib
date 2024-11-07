import { ChatService } from "@infra/services/ChatService";
import { ipcMain, IpcMainInvokeEvent } from "electron";
import IMessage from "@domain/entities/Message";

import ListTextChunksUseCase from "@application/usecases/TextChunk/ListTextChunksUseCase";

import { SettingRepositorySequelize } from "@infra/database/adapters/SettingRepository";
import { TextChunkRepositorySequelize } from "@infra/database/adapters/TextChunkRepository";

import { QDrantService } from "../../infrastructure/services/QDrantService";
import { RAGService } from "../../infrastructure/services/RAGService";
import { OpenAIService } from "../../infrastructure/services/OpenAIService";
import { SettingService } from "@infra/services/SettingService";

import { OpenAIAdapter } from "../../infrastructure/adapters/OpenAIAdapter";
import { QDrantAdapter } from "../../infrastructure/adapters/QDrantAdapter";

const settingRepository = new SettingRepositorySequelize();
const textChunkRepository = new TextChunkRepositorySequelize();

const settingService = new SettingService(settingRepository);
const qdrantService = new QDrantService(new QDrantAdapter(settingService));

const listTextChunksUseCase = new ListTextChunksUseCase(textChunkRepository);

const documentFilter = (documentId: string) => {
    return {
        filter: {
            must: [
                {
                    key: "documentId",
                    match: {
                        value: Number(documentId),
                    },
                },
            ],
        },
    };
};

const collectionFilter = (collectionId: number) => {
    return {
        filter: {
            must: [
                {
                    key: "collectionId",
                    match: {
                        value: collectionId,
                    },
                },
            ],
        },
    };
};

async function chat(
    event: IpcMainInvokeEvent,
    messages: IMessage[],
    filter: object,
) {
    const openaiApiKey = await settingService.getOpenAIApiKey();
    const conversationModel = await settingService.getConversationModel();
    const embeddingModel = await settingService.getEmbeddingModel();

    const openAIAdapater = new OpenAIAdapter(openaiApiKey);
    openAIAdapater.setConversationModel(conversationModel);
    openAIAdapater.setEmbeddingModel(embeddingModel);

    const openAIService = new OpenAIService(openAIAdapater, settingService);

    const ragService = new RAGService(
        openAIService,
        qdrantService,
        settingService,
    );

    const chatService = new ChatService(openAIService, event.sender);

    await chatService.chatStream(
        messages,
        filter,
        ragService,
        listTextChunksUseCase,
    );
}

ipcMain.handle("chatWithCollection", async (event, messages, collectionId) => {
    await chat(event, messages, collectionFilter(collectionId));
});

ipcMain.handle("chatWithDocument", async (event, messages, documentId) => {
    await chat(event, messages, documentFilter(documentId));
});
