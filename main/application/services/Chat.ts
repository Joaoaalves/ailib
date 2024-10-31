import { IMessage } from "@domain/entities/Message";
import { IOpenAIService } from "@infra/adapters/OpenAI";
import { staticPrompts } from "@prompts/staticPrompts";

export class ChatService {
    constructor(private openAiService: IOpenAIService) {}
    async createChatTitle(message: IMessage, model: string): Promise<string> {
        return this.openAiService.chat(
            [staticPrompts.titleCreationInstruction, message],
            model,
        );
    }
}
