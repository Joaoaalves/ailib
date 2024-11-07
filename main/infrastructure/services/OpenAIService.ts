import IMessage from "@domain/entities/Message";

import { IOpenAIService } from "@infra/adapters/OpenAIAdapter";
import { ISettingService } from "./SettingService";

export class OpenAIService implements IOpenAIService {
    constructor(
        private openAIAdapter: IOpenAIService,
        private settingService: ISettingService,
    ) {}

    private async checkAPIKey() {
        return await this.settingService.getOpenAIApiKey;
    }

    async getEmbeddings(text: string) {
        if (await this.checkAPIKey()) {
            return await this.openAIAdapter.getEmbeddings(text);
        }

        throw new Error("OpenAI API Key is not set.");
    }

    async chatStream(messages: IMessage[]) {
        if (await this.checkAPIKey()) {
            return await this.openAIAdapter.chatStream(messages);
        }

        throw new Error("OpenAI API Key is not set.");
    }

    async chat(messages: IMessage[]) {
        if (await this.checkAPIKey()) {
            return await this.openAIAdapter.chat(messages);
        }

        throw new Error("OpenAI API Key is not set.");
    }
}
