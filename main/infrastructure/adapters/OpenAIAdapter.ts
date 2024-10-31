import OpenAI from "openai";
import { ChatCompletionChunk } from "openai/resources";
import { Stream } from "openai/streaming";

import IMessage from "@domain/entities/Message";

import { SettingRepository } from "@application/repositories/SettingRepository.";

export interface IOpenAIService {
    getEmbeddings(text: string, model: string): Promise<number[]>;
    chat(messages: IMessage[], model: string): Promise<string>;
    chatStream(
        messages: IMessage[],
        model: string,
    ): Promise<Stream<ChatCompletionChunk>>;
}

export class OpenAIAdapter implements IOpenAIService {
    private client: OpenAI;
    constructor(private settingRepository: SettingRepository) {}

    async startClient(): Promise<void> {
        const apiKey = await this.settingRepository.findById("openaiAPIKey");
        this.client = new OpenAI({ apiKey: apiKey.value });
    }

    async getEmbeddings(text: string, model: string): Promise<number[]> {
        if (!this.client) await this.startClient();

        try {
            const response = await this.client.embeddings.create({
                model,
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
        model: string,
    ): Promise<Stream<ChatCompletionChunk>> {
        if (!this.client) await this.startClient();

        return this.client.chat.completions.create({
            model,
            messages,
            stream: true,
        });
    }

    async chat(messages: IMessage[], model: string): Promise<string> {
        if (!this.client) await this.startClient();

        const response = await this.client.chat.completions.create({
            model,
            messages,
        });

        return response?.choices[0].message.content ?? "Error.";
    }
}
