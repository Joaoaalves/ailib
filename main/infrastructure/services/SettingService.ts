import ISettingRepository from "@domain/repositories/SettingRepository";

export interface ISettingService {
    getConversationModel(): Promise<string>;
    getEmbeddingModel(): Promise<string>;
    getSQRModel(): Promise<string>;
    getHYDEModel(): Promise<string>;
    getOpenAIApiKey(): Promise<string>;
    sqrEnabled(): Promise<string>;
    hydeEnabled(): Promise<string>;
}

export class SettingService implements ISettingService {
    constructor(private settingRepository: ISettingRepository) {}

    async getConversationModel() {
        return (await this.settingRepository.findById("conversationModel"))
            .value;
    }

    async getEmbeddingModel(): Promise<string> {
        return (await this.settingRepository.findById("embeddingModel")).value;
    }
    async getSQRModel(): Promise<string> {
        return (await this.settingRepository.findById("sqrModel")).value;
    }
    async getHYDEModel(): Promise<string> {
        return (await this.settingRepository.findById("hydeModel")).value;
    }

    async getOpenAIApiKey(): Promise<string> {
        return (await this.settingRepository.findById("openaiAPIKey")).value;
    }

    async sqrEnabled(): Promise<string> {
        return (
            await this.settingRepository.findById("selfQueryRetrievalEnabled")
        ).value;
    }

    async hydeEnabled(): Promise<string> {
        return (await this.settingRepository.findById("hydeEnabled")).value;
    }
}
