import { ipcMain, IpcMainInvokeEvent } from "electron";
import IMessage from "@domain/entities/Message";
import { staticPrompts } from "@prompts/staticPrompts";
import { Op } from "sequelize";

import { SettingRepositorySequelize } from "@infra/database/adapters/SettingRepository";
import { TextChunkRepositorySequelize } from "@infra/database/adapters/TextChunkRepository";

import { QDrantService } from "../../infrastructure/services/QDrantService";
import { RAGService } from "../../infrastructure/services/RAGService";
import { OpenAIService } from "../../infrastructure/services/OpenAIService";

import { OpenAIAdapter } from "../../infrastructure/adapters/OpenAIAdapter";
import { QDrantAdapter } from "../../infrastructure/adapters/QDrantAdapter";
import GetSettingUseCase from "@application/usecases/Setting/GetSettingUseCase";
import ListTextChunksUseCase from "@application/usecases/TextChunk/ListTextChunksUseCase";

const settingRepository = new SettingRepositorySequelize();
const textChunkRepository = new TextChunkRepositorySequelize();

const qdrantService = new QDrantService(new QDrantAdapter(settingRepository));

const getSettingUseCase = new GetSettingUseCase(settingRepository);

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

async function streamChatStatus(
    event: IpcMainInvokeEvent,
    message: string,
    isLoading: boolean = true,
) {
    return event.sender.send("chat-stream", {
        isLoading,
        message,
    });
}

async function chat(
    event: IpcMainInvokeEvent,
    messages: IMessage[],
    filter: object,
) {
    const openaiApiKey = (await getSettingUseCase.execute("openaiAPIKey"))
        .value;

    const openAIService = new OpenAIService(
        new OpenAIAdapter(openaiApiKey),
        settingRepository,
    );

    const ragService = new RAGService(
        openAIService,
        qdrantService,
        settingRepository,
    );

    streamChatStatus(event, "Searching for information over your library.");

    const userQuery = messages.at(-1).content;

    ragService.execute(userQuery, filter).then(async (result) => {
        streamChatStatus(event, "Sending best results to AI");

        const chunkIds = result.map((result) => result.chunkId);

        const textChunks = await listTextChunksUseCase.execute({
            where: {
                id: {
                    [Op.or]: chunkIds,
                },
            },
            attributes: ["text"],
        });

        const lastMessage = messages.pop();

        lastMessage.content =
            "Contexto:\n---\n" +
            JSON.stringify(textChunks) +
            "\n---\nMensagem original do usuário:\n---\n" +
            lastMessage.content;

        const systemMessage = staticPrompts.defaultChatInstruction;

        messages = [systemMessage, ...messages, lastMessage];

        const completionStream = await openAIService.chatStream(
            messages,
            (await settingRepository.findById("conversationModel")).value,
        );

        for await (const chunk of completionStream) {
            event.sender.send("chat-stream", chunk);
        }

        event.sender.send("chat-stream-end");

        await streamChatStatus(event, "", false);
    });
}

ipcMain.handle("chatWithCollection", async (event, messages, collectionId) => {
    await chat(event, messages, collectionFilter);
});

ipcMain.handle("chatWithDocument", async (event, messages, documentId) => {
    await chat(event, messages, documentFilter);
});
