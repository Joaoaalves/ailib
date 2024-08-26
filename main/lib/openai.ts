import { OpenAI } from "openai";
import { promises as fs } from "fs";
import { upsertEmbedding } from "./qdrant";
import { IpcMainInvokeEvent } from "electron";
import { IModels } from "shared/types/openai";
import { IMessage } from "shared/types/conversation";
import { encoding_for_model, Tiktoken, TiktokenModel } from "tiktoken";
import { Prompts } from "../helpers/systemPrompts";
import { RAGFusion } from "./rag";
import { Metadata, RankedSearchResult } from "shared/types/qdrant";

const CONFIG_FILE_PATH = "api_key.config";

async function OpenAIClient() {
    const apiKey = await loadApiKey();
    return new OpenAI({ apiKey });
}

export const Models: IModels = {
    embedding: {
        openai: "text-embedding-3-small",
        tiktoken: "text-embedding-ada-002",
        pricingPer1M: 0.02,
    },
    chat: {
        openai: "gpt-4o-mini",
        tiktoken: "gpt-4o-mini",
        pricingPer1M: 0.15,
    },
};

export async function getEmbeddings(textChunk: string): Promise<number[]> {
    const openai = await OpenAIClient();

    try {
        const response = await openai.embeddings.create({
            model: Models.embedding.openai,
            input: textChunk,
        });

        const embedding = response.data[0]?.embedding as number[];

        return embedding;
    } catch (error) {
        throw new Error(`Failed to fetch embeddings: ${error.message}`);
    }
}

export async function saveApiKey(apiKey: string): Promise<void> {
    try {
        await fs.writeFile(CONFIG_FILE_PATH, apiKey);
    } catch (error) {
        throw new Error(`Failed to save API key: ${error.message}`);
    }
}

export async function loadApiKey(): Promise<string> {
    try {
        const apiKey = await fs.readFile(CONFIG_FILE_PATH, "utf8");
        return apiKey;
    } catch (error) {
        console.error(`Failed to load API key: ${error.message}`);
        return "";
    }
}

export async function summarizePages(
    event: IpcMainInvokeEvent,
    pages: string[],
    lastSummary: string,
): Promise<string> {
    const openai = await OpenAIClient();
    const summaryCreationInstruction = Prompts.summaryCreationInstruction;

    try {
        const response = await openai.chat.completions.create({
            model: Models.chat.openai,
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
    metadata: Metadata,
) {
    try {
        for (let index = 1; index <= chunks.length; index++) {
            const chunk = chunks[index];
            if (chunk.length < 100) continue;

            const embedding = await getEmbeddings(chunk);

            metadata.page = index;
            await upsertEmbedding({
                embedding,
                chunk,
                metadata,
            });

            event.sender.send("embedding_progress", {
                chunk: index + 1,
                total: chunks.length,
                embedding: embedding,
            });
        }
    } catch (error) {
        console.error("Error processing chunks:", error);
    }
}

export async function createConversationTitle(message: IMessage) {
    const apiKey = await loadApiKey();
    const openai = new OpenAI({ apiKey });

    const systemMessage = Prompts.titleCreationInstruction;

    const completion = await openai.chat.completions.create({
        model: Models.chat.openai,
        messages: [systemMessage, message],
    });

    return completion.choices[0].message.content;
}

export async function chatWithDocument(
    event: IpcMainInvokeEvent,
    messages: IMessage[],
    documentId: number,
) {
    const relevantQueries = await getMoreQueries(messages.at(-1));
    const queries = [messages.at(-1).content, ...relevantQueries];

    const systemMessage = Prompts.defaultChatInstruction;

    RAGFusion(queries, documentId).then(async (RAGResult) => {
        const result = RAGResult.map((result) => result.content);
        const lastMessage = messages.pop();

        lastMessage.content =
            JSON.stringify(result) +
            "\nMensagem original do usuário:\n" +
            lastMessage.content;

        messages = [systemMessage, ...messages, lastMessage];

        await streamCompletion(event, messages, "chat-stream");

        streamDocumentContext(event, RAGResult);

        event.sender.send("chat-stream-end");
    });
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

    const stream = await openai.chat.completions.create({
        model: Models.chat.openai,
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

async function getMoreQueries(
    question: IMessage,
    queryNum: number = 5,
): Promise<string[]> {
    const openai = await OpenAIClient();
    const systemMessage = Prompts.queryCreationInstruction;

    const completion = await openai.chat.completions.create({
        model: Models.chat.openai,
        messages: [systemMessage, question],
    });

    return completion.choices[0].message.content.split(";");
}
