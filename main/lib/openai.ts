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
    const model = await Models.chat();

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

            // Divida o chunk em 5 partes semânticas (com base em pontos finais)
            const chunkParts = splitChunkSemantically(chunk, 5);

            // Use Promise.all para obter os embeddings de cada parte em paralelo
            const embeddings = await Promise.all(
                chunkParts.map(async (part) => {
                    return await getEmbeddings(part);
                }),
            );

            // Insira os embeddings individualmente no Qdrant
            for (const [partIndex, embedding] of embeddings.entries()) {
                metadata.page = offset + index;
                metadata.chunkId = textChunk.id;
                await upsertEmbedding({
                    embedding,
                    metadata,
                });
            }

            // Envie o progresso de embedding para o front-end
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
    const sentences = chunk.match(/[^.!?]+[.!?]+/g) || [chunk]; // Divide por pontos finais
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

        // Verifique se o comprimento acumulado está próximo do comprimento alvo para a parte
        if (
            currentLength >= targetPartLength ||
            (i === sentences.length - 1 && chunkParts.length < parts - 1)
        ) {
            chunkParts.push(currentPart.trim());
            currentPart = "";
            currentLength = 0;
        }
    }

    // Se restar algum texto, adicione como última parte
    if (currentPart) {
        chunkParts.push(currentPart.trim());
    }

    // Se houver menos partes do que o necessário, redistribuir
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

async function chat(
    event: IpcMainInvokeEvent,
    messages: IMessage[],
    filter: Object,
) {
    const userQuery = messages.at(-1).content;

    const relevantQueries = await getMoreQueries(userQuery);
    const queries = [userQuery, ...relevantQueries];

    console.log(queries);
    console.log("\n\n\n");
    const hypotethicalDocuments = await Promise.all(
        queries.map(async (query) => {
            return await createHypotheticalDocument(query);
        }),
    );

    console.log(hypotethicalDocuments);
    console.log("\n\n\n");
    const systemMessage = Prompts.defaultChatInstruction;

    RAGFusion(hypotethicalDocuments, filter).then(async (RAGResult) => {
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
        console.log(textChunks);
        console.log("\n\n\n");
        lastMessage.content =
            "Contexto retornado do Retrieval Augmented Generation:\n---\n" +
            JSON.stringify(textChunks) +
            "\n---\nMensagem original do usuário:\n---\n" +
            lastMessage.content;
        messages = [systemMessage, ...messages, lastMessage];

        await streamCompletion(event, messages, "chat-stream");

        streamDocumentContext(event, RAGResult);

        event.sender.send("chat-stream-end");
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

export async function createHypotheticalDocument(query: string) {
    const openai = await OpenAIClient();
    const systemMessage = Prompts.createHyDEInstruction;
    const model = await Models.chat();

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

export async function getMoreQueries(query: string): Promise<string[]> {
    const openai = await OpenAIClient();
    const systemMessage = Prompts.queryCreationInstruction;
    const model = await Models.chat();

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
