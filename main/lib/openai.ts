import { IChatStatus } from "./../../shared/types/conversation";
import { OpenAI } from "openai";
import { Op } from "sequelize";
import { upsertEmbedding } from "./qdrant";
import { IpcMainInvokeEvent } from "electron";
import { IMessage } from "shared/types/conversation";
import { encoding_for_model, Tiktoken, TiktokenModel } from "tiktoken";
import { Prompts } from "../helpers/systemPrompts";
import { RAGFusion } from "./rag";
import { Metadata, RankedSearchResult } from "shared/types/qdrant";
import Config from "../db/config";
import TextChunk from "../db/textChunk";

async function OpenAIClient() {
    const apiKey = await Config.findByPk("openaiAPIKey");
    return new OpenAI({ apiKey: apiKey.value });
}

export const Models = {
    chat: async () => {
        const model = await Config.findByPk("conversationModel");
        return model.value;
    },
    embeddings: async () => {
        const model = await Config.findByPk("embeddingModel");
        return model.value;
    },
    hyde: async () => {
        const model = await Config.findByPk("hydeModel");
        return model.value;
    },
    sqr: async () => {
        const model = await Config.findByPk("selfQueryRetrievalModel");
        return model.value;
    },
    summary: async () => {
        const model = await Config.findByPk("summaryModel");
        return model.value;
    },
};

export async function getEmbeddings(textChunk: string): Promise<number[]> {
    const openai = await OpenAIClient();
    const model = await Models.embeddings();

    try {
        const response = await openai.embeddings.create({
            model,
            input: textChunk,
        });

        const embedding = response.data[0]?.embedding as number[];

        return embedding;
    } catch (error) {
        throw new Error(`Failed to fetch embeddings: ${error.message}`);
    }
}

export async function summarizePages(
    event: IpcMainInvokeEvent,
    pages: string[],
    lastSummary: string,
): Promise<string> {
    const openai = await OpenAIClient();
    const summaryCreationInstruction = Prompts.summaryCreationInstruction;
    const model = await Models.summary();

    try {
        const response = await openai.chat.completions.create({
            model,
            messages: [
                summaryCreationInstruction,
                {
                    role: "user",
                    content:
                        pages.join("\n") +
                        "\n\nUltimo resumo, siga a partir dele: " +
                        lastSummary,
                },
            ],
        });

        const content = response.choices[0].message.content;

        return content;
    } catch (error) {
        throw error;
    }
}

export async function processChunks(
    event: IpcMainInvokeEvent,
    chunks: string[],
    offset: number,
    metadata: Metadata,
) {
    try {
        for (let index = 0; index < chunks.length; index++) {
            const chunk = chunks[index];

            const textChunk = await TextChunk.create({
                text: chunk,
            });

            const chunkParts = splitChunkSemantically(chunk, 5);

            const embeddings = await Promise.all(
                chunkParts.map(async (part) => {
                    return await getEmbeddings(part);
                }),
            );

            for (const [partIndex, embedding] of embeddings.entries()) {
                metadata.page = offset + index;
                metadata.chunkId = textChunk.id;
                await upsertEmbedding({
                    embedding,
                    metadata,
                });
            }

            event.sender.send("embedding_progress", {
                chunk: index + 1,
                total: chunks.length,
                embedding: embeddings,
            });
        }
    } catch (error) {
        console.error("Error processing chunks:", error);
    }
}

function splitChunkSemantically(chunk: string, parts: number): string[] {
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

export async function createConversationTitle(message: IMessage) {
    const openai = await OpenAIClient();
    const model = await Models.chat();
    const systemMessage = Prompts.titleCreationInstruction;

    const completion = await openai.chat.completions.create({
        model,
        messages: [systemMessage, message],
    });

    return completion.choices[0].message.content;
}

async function streamChatStatus(
    event: IpcMainInvokeEvent,
    message: string,
    isLoading: boolean = true,
) {
    return event.sender.send("chat-status", {
        isLoading,
        message,
    });
}

async function chat(
    event: IpcMainInvokeEvent,
    messages: IMessage[],
    filter: Object,
) {
    const userQuery = messages.at(-1).content;
    let queries = [userQuery];

    if (await isSQREnabled()) {
        await streamChatStatus(event, "Doing Self Query Retrieval");

        const relevantQueries = await getMoreQueries(userQuery);
        queries.push(...relevantQueries);
    }

    if (await isHyDEEnabled()) {
        await streamChatStatus(event, "Doing Hypotethical Document Embeddings");

        const hypotethicalDocuments = await Promise.all(
            queries.map(async (query) => {
                return await createHypotheticalDocument(query);
            }),
        );

        queries = hypotethicalDocuments;
    }

    const systemMessage = Prompts.defaultChatInstruction;

    streamChatStatus(event, "Doing RAG Fusion");

    RAGFusion(queries, filter).then(async (RAGResult) => {
        await streamChatStatus(event, "Sending best results to AI");
        const chunkIds = RAGResult.map((result) => result.chunkId);

        const textChunks = await TextChunk.findAll({
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

        await streamCompletion(event, messages, "chat-stream");

        streamDocumentContext(event, RAGResult);

        event.sender.send("chat-stream-end");
        await streamChatStatus(event, "", false);
    });
}

export async function chatWithCollection(
    event: IpcMainInvokeEvent,
    messages: IMessage[],
    collectionId: number,
) {
    const filter = {
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

    return chat(event, messages, filter);
}

export async function chatWithDocument(
    event: IpcMainInvokeEvent,
    messages: IMessage[],
    documentId: number,
) {
    const filter = {
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

    return chat(event, messages, filter);
}

function streamDocumentContext(
    event: IpcMainInvokeEvent,
    result: RankedSearchResult[],
) {
    result.map((result) => event.sender.send("chat-stream-files", result));
}

async function streamCompletion(
    event: IpcMainInvokeEvent,
    messages: IMessage[],
    channel: string,
) {
    const openai = await OpenAIClient();
    const model = await Models.chat();
    const stream = await openai.chat.completions.create({
        model,
        messages: messages,
        stream: true,
    });

    for await (const chunk of stream) {
        event.sender.send(channel, chunk);
    }
}

export function countTokens(text: string, model: TiktokenModel): number {
    try {
        const encoding: Tiktoken = encoding_for_model(model);

        const tokens = encoding.encode(text);
        const tokenCount = tokens.length;

        encoding.free();

        return tokenCount;
    } catch (error) {
        console.error("Erro ao contar tokens:", error);
        return 0;
    }
}

async function isHyDEEnabled() {
    const hydeEnabled = await Config.findByPk("hydeEnabled");
    return hydeEnabled.value == "true";
}

export async function createHypotheticalDocument(query: string) {
    const openai = await OpenAIClient();
    const systemMessage = Prompts.createHyDEInstruction;
    const model = await Models.hyde();

    const queryMessage: IMessage = {
        role: "user",
        content: query,
    };

    const hypotheticalDocument = await openai.chat.completions.create({
        model,
        messages: [systemMessage, queryMessage],
    });

    return hypotheticalDocument.choices[0].message.content;
}

async function isSQREnabled() {
    const sqrEnabled = await Config.findByPk("selfQueryRetrievalEnabled");
    return sqrEnabled.value == "true";
}

export async function getMoreQueries(query: string): Promise<string[]> {
    const openai = await OpenAIClient();
    const systemMessage = Prompts.queryCreationInstruction;
    const model = await Models.sqr();

    const queryMessage: IMessage = {
        role: "user",
        content: query,
    };

    const completion = await openai.chat.completions.create({
        model,
        messages: [systemMessage, queryMessage],
    });

    return completion.choices[0].message.content.split(";");
}
