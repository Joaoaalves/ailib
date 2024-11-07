import OpenAI from "openai";
import { ChatCompletionChunk } from "openai/resources";
import { Stream } from "openai/streaming";

import IMessage from "@domain/entities/Message";

export interface IOpenAIService {
    getEmbeddings(text: string): Promise<number[]>;
    chat(messages: IMessage[]): Promise<string>;
    chatStream(messages: IMessage[]): Promise<Stream<ChatCompletionChunk>>;
    setConversationModel?(conversationModel: string): void;
    setEmbeddingModel?(embeddingModel: string): void;
}

export class OpenAIAdapter implements IOpenAIService {
    private client: OpenAI;
    private conversationModel: string;
    private embeddingModel: string;

    constructor(private apiKey: string) {}

    setConversationModel(conversationModel: string): void {
        this.conversationModel = conversationModel;
    }

    setEmbeddingModel(embeddingModel: string): void {
        this.embeddingModel = embeddingModel;
    }

    async startClient(): Promise<void> {
        this.client = new OpenAI({ apiKey: this.apiKey });
    }

    async getEmbeddings(text: string): Promise<number[]> {
        if (!this.client) await this.startClient();

        try {
            const response = await this.client.embeddings.create({
                model: this.embeddingModel,
                input: text,
            });

            const embedding = response.data[0]?.embedding as number[];

            return embedding;
        } catch (error) {
            throw new Error(`Failed to fetch embeddings: ${error.message}`);
        }
    }

    async chatStream(
        messages: IMessage[],
    ): Promise<Stream<ChatCompletionChunk>> {
        if (!this.conversationModel)
            throw new Error(
                "You should set conversation model before calling 'chatStream'",
            );
        if (!this.client) await this.startClient();

        return this.client.chat.completions.create({
            model: this.conversationModel,
            messages,
            stream: true,
        });
    }

    async chat(messages: IMessage[]): Promise<string> {
        if (!this.conversationModel)
            throw new Error("Conversation Model needs to be setted");
        if (!this.client) await this.startClient();

        const response = await this.client.chat.completions.create({
            model: this.conversationModel,
            messages,
        });

        return response?.choices[0].message.content ?? "Error.";
    }
}
