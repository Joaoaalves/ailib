import { staticPrompts } from "@prompts/staticPrompts";

import IMessage from "@domain/entities/Message";

import {
    IResultRanker,
    ResultRanker,
} from "@infra/services/ResultRankerService";

import { IOpenAIService } from "@infra/adapters/OpenAIAdapter";
import { IQDrantService } from "@infra/adapters/QDrantAdapter";
import ISettingRepository from "@domain/repositories/SettingRepository";

export interface IRAGService {
    createHypotheticalDocument(query: string, model: string): Promise<string>;
    generateQueries(query: string, model: string): Promise<string>;
}

export class RAGService implements IRAGService {
    private resultRankerService: IResultRanker = new ResultRanker();

    constructor(
        private openAIService: IOpenAIService,
        private qdrantService: IQDrantService,
        private settingRepository: ISettingRepository,
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
        const sqrSetting = await this.settingRepository.findById(
            "selfQueryRetrievalEnabled",
        );

        return sqrSetting.value == "true";
    }

    private async isHyDEEnabled(): Promise<boolean> {
        const hydeSetting =
            await this.settingRepository.findById("hydeEnabled");

        return hydeSetting.value == "true";
    }

    private async getSQRModel(): Promise<string> {
        return (
            await this.settingRepository.findById("selfQueryRetrievalModel")
        ).value;
    }

    private async getHyDEModel(): Promise<string> {
        return (await this.settingRepository.findById("hydeModel")).value;
    }

    private async getEmbeddingModel(): Promise<string> {
        return (await this.settingRepository.findById("embeddingModel")).value;
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

        return this.RAGFusion(embeddedQueries, filter);
    }

    async createHypotheticalDocument(query: string): Promise<string> {
        if (!this.isHyDEEnabled()) return;

        const hydeModel = await this.getHyDEModel();

        return await this.openAIService.chat(
            [staticPrompts.createHyDEInstruction, this.createMessage(query)],
            hydeModel,
        );
    }

    async generateQueries(query: string): Promise<string> {
        if (!this.isSQREnabled()) return;

        const sqrModel = await this.getSQRModel();

        return await this.openAIService.chat(
            [staticPrompts.queryCreationInstruction, this.createMessage(query)],
            sqrModel,
        );
    }

    async embeddQuery(query: string): Promise<number[]> {
        const embeddingModel = await this.getEmbeddingModel();

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
