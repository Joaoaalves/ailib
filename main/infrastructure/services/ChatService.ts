import IMessage from "@domain/entities/Message";
import ISettingRepository from "@domain/repositories/SettingRepository";
import { IOpenAIService } from "@infra/adapters/OpenAIAdapter";
import { staticPrompts } from "@prompts/staticPrompts";

export class ChatService {
    constructor(
        private openAiService: IOpenAIService,
        private settingRepository: ISettingRepository,
    ) {}

    async getConversationModel(): Promise<string> {
        return (await this.settingRepository.findById("conversationModel"))
            .value;
    }

    async createChatTitle(message: IMessage): Promise<string> {
        const conversationModel = await this.getConversationModel();
        return this.openAiService.chat(
            [staticPrompts.titleCreationInstruction, message],
            conversationModel,
        );
    }
}
