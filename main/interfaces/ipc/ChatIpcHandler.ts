import { ipcMain, IpcMainInvokeEvent } from "electron";
import { IMessage } from "@domain/entities/Message";
import { staticPrompts } from "@prompts/staticPrompts";
import { Op } from "sequelize";

import { SettingRepository } from "@application/repositories/SettingRepository.";
import { TextChunkRepository } from "@application/repositories/TextChunkRepository.";

import { QDrantService } from "../../infrastructure/services/QDrant";
import { RAGService } from "../../infrastructure/services/RAG";
import { OpenAIService } from "../../infrastructure/services/OpenAI";

import { OpenAIAdapter } from "../../infrastructure/adapters/OpenAIAdapter";
import { QDrantAdapter } from "../../infrastructure/adapters/QDrantAdapter";

const settingRepository = new SettingRepository();
const textChunkRepository = new TextChunkRepository();

const openAIService = new OpenAIService(
    new OpenAIAdapter(settingRepository),
    settingRepository,
);

const qdrantService = new QDrantService(new QDrantAdapter(settingRepository));

const ragService = new RAGService(openAIService, qdrantService);

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

async function isSQREnabled(): Promise<boolean> {
    const sqrSetting = await settingRepository.findById(
        "selfQueryRetrievalEnabled",
    );

    return sqrSetting.value == "true";
}

async function isHyDEEnabled(): Promise<boolean> {
    const hydeSetting = await settingRepository.findById("hydeEnabled");

    return hydeSetting.value == "true";
}

async function chat(
    event: IpcMainInvokeEvent,
    messages: IMessage[],
    filter: object,
) {
    const sqrModel = await settingRepository.findById(
        "selfQueryRetrievalModel",
    );
    const hydeModel = await settingRepository.findById("hydeModel");
    const embeddingModel = await settingRepository.findById("embeddingModel");
    const conversationModel =
        await settingRepository.findById("conversationModel");

    const userQuery = messages.at(-1).content;
    let queries = [userQuery];

    if (await isSQREnabled()) {
        await streamChatStatus(event, "Doing Self Query Retrieval");

        const relevantQueries = await ragService.generateQueries(
            userQuery,
            sqrModel.value,
        );
        queries.push(...relevantQueries.split(";"));
    }

    if (await isHyDEEnabled()) {
        await streamChatStatus(event, "Doing Hypotethical Document Embeddings");

        const hypotethicalDocuments = await Promise.all(
            queries.map(async (query) => {
                return ragService.createHypotheticalDocument(
                    query,
                    hydeModel.value,
                );
            }),
        );

        queries = hypotethicalDocuments;
    }

    const embeddedQueries = await Promise.all(
        queries.map(async (query) => {
            return ragService.embeddQuery(query, embeddingModel.value);
        }),
    );

    const systemMessage = staticPrompts.defaultChatInstruction;

    streamChatStatus(event, "Doing RAG Fusion");

    ragService.RAGFusion(embeddedQueries, filter).then(async (result) => {
        streamChatStatus(event, "Sending best results to AI");

        const chunkIds = result.map((result) => result.chunkId);

        const textChunks = await textChunkRepository.findAll({
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

        messages = [systemMessage, ...messages, lastMessage];

        const completionStream = await openAIService.chatStream(
            messages,
            conversationModel.value,
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
