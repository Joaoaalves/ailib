import { staticPrompts } from "@prompts/staticPrompts";

import IMessage from "@domain/entities/Message";

import {
    IResultRanker,
    ResultRanker,
} from "@infra/services/ResultRankerService";

import { IOpenAIService } from "@infra/adapters/OpenAIAdapter";
import { IQDrantService } from "@infra/adapters/QDrantAdapter";
import { ISettingService } from "./SettingService";

export interface IRAGService {
    createHypotheticalDocument(query: string, model: string): Promise<string>;
    generateQueries(query: string, model: string): Promise<string>;
    execute(userQuery: string, filter: object);
}

export class RAGService implements IRAGService {
    private resultRankerService: IResultRanker = new ResultRanker();

    constructor(
        private openAIService: IOpenAIService,
        private qdrantService: IQDrantService,
        private settingService: ISettingService,
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

    private async isSQREnabled(): Promise<boolean> {
        return (await this.settingService.sqrEnabled()) == "true";
    }

    private async isHyDEEnabled(): Promise<boolean> {
        return (await this.settingService.hydeEnabled()) == "true";
    }

    async execute(userQuery: string, filter: object) {
        let queries = [userQuery];

        this.generateQueries(userQuery).then((relevantQueries) => {
            if (relevantQueries) {
                queries.push(...relevantQueries.split(";"));
            }
        });

        const hypotethicalDocuments = await Promise.all(
            queries.map(async (query) =>
                this.createHypotheticalDocument(query),
            ),
        );

        if (hypotethicalDocuments) queries = hypotethicalDocuments;

        const embeddedQueries = await Promise.all(
            queries.map(async (query) => this.embeddQuery(query)),
        );

        return await this.RAGFusion(embeddedQueries, filter);
    }

    async createHypotheticalDocument(query: string): Promise<string> {
        if (!this.isHyDEEnabled()) return;

        return await this.openAIService.chat([
            staticPrompts.createHyDEInstruction,
            this.createMessage(query),
        ]);
    }

    async generateQueries(query: string): Promise<string> {
        if (!this.isSQREnabled()) return;

        return await this.openAIService.chat([
            staticPrompts.queryCreationInstruction,
            this.createMessage(query),
        ]);
    }

    async embeddQuery(query: string): Promise<number[]> {
        return this.openAIService.getEmbeddings(query);
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
