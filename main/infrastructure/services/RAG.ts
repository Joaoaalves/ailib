import { staticPrompts } from "@prompts/staticPrompts";

import { IMessage } from "@domain/entities/Message";

import {
    IResultRanker,
    ResultRanker,
} from "@application/services/ResultRanker";

import { IOpenAIService } from "@infra/adapters/OpenAI";
import { IQDrantService } from "@infra/adapters/QDrant";

export interface IRAGService {
    createHypotheticalDocument(query: string, model: string): Promise<string>;
    generateQueries(query: string, model: string): Promise<string>;
}

export class RAGService implements IRAGService {
    private resultRankerService: IResultRanker = new ResultRanker();
    constructor(
        private openAIService: IOpenAIService,
        private qdrantService: IQDrantService,
    ) {}

    private createMessage(
        query: string,
        role: "user" | "assistant" | "system" = "user",
    ): IMessage {
        return {
            role: role,
            content: query,
        };
    }

    async createHypotheticalDocument(
        query: string,
        model: string,
    ): Promise<string> {
        return await this.openAIService.chat(
            [staticPrompts.createHyDEInstruction, this.createMessage(query)],
            model,
        );
    }

    async generateQueries(query: string, model: string): Promise<string> {
        return await this.openAIService.chat(
            [staticPrompts.queryCreationInstruction, this.createMessage(query)],
            model,
        );
    }

    async embeddQuery(
        query: string,
        embeddingModel: string,
    ): Promise<number[]> {
        return this.openAIService.getEmbeddings(query, embeddingModel);
    }

    async simpleRAG(
        embeddedQuery: number[],
        filter: Object = {},
    ): Promise<Object[]> {
        const result = await this.qdrantService.searchOnDocuments(
            embeddedQuery,
            2,
            filter,
        );
        return result;
    }

    async RAGFusion(embeddedQueries: number[][], filter: Object = {}) {
        const resultsArray = [];
        for (let i = 0; i < embeddedQueries.length; i++) {
            const ragResult = await this.simpleRAG(embeddedQueries[i], filter);
            resultsArray.push(ragResult);
        }

        const resultsFlatened: any = resultsArray.flat();

        return this.resultRankerService.rank(resultsFlatened);
    }
}
