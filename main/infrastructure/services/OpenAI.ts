import { IMessage } from "@domain/entities/Message";

import { ISettingRepository } from "@domain/entities/Setting";

import { IOpenAIService } from "@infra/adapters/OpenAI";

export class OpenAIService {
    constructor(
        private openAIAdapter: IOpenAIService,
        private settingRepository: ISettingRepository,
    ) {}

    private async checkAPIKey() {
        return await this.settingRepository.findById("openaiAPIKey");
    }

    async getEmbeddings(text: string, model: string) {
        if (await this.checkAPIKey())
            return await this.openAIAdapter.getEmbeddings(text, model);

        throw new Error("OpenAI API Key is not set.");
    }

    async chatStream(messages: IMessage[], model: string) {
        if (await this.checkAPIKey())
            return await this.openAIAdapter.chatStream(messages, model);

        throw new Error("OpenAI API Key is not set.");
    }

    async chat(messages: IMessage[], model: string) {
        if (await this.checkAPIKey())
            return await this.openAIAdapter.chat(messages, model);

        throw new Error("OpenAI API Key is not set.");
    }
}
