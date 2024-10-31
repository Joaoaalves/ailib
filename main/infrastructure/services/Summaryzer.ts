import { staticPrompts } from "@prompts/staticPrompts";

import { IMessage } from "@domain/entities/Message";

import { IOpenAIService } from "@infra/adapters/OpenAI";

export interface ISummaryzerService {
    summarizePages(
        pages: string[],
        lastSummary: string,
        model: string,
    ): Promise<string | null>;
}

export class SummaryzerService implements ISummaryzerService {
    constructor(private openAIService: IOpenAIService) {}

    private createMessage(
        query: string,
        role: "user" | "assistant" | "system" = "user",
    ): IMessage {
        return {
            role: role,
            content: query,
        };
    }

    async summarizePages(
        pages: string[],
        lastSummary: string,
        model: string,
    ): Promise<string | null> {
        try {
            const userMessage = this.createMessage(
                pages.join("\n") +
                    "\n\nUltimo resumo, siga a partir dele: " +
                    lastSummary,
            );

            const content = await this.openAIService.chat(
                [staticPrompts.summaryCreationInstruction, userMessage],
                model,
            );
            return content;
        } catch (error) {
            throw error;
        }
    }
}
