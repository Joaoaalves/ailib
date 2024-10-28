import { ISummary, ISummaryRepository } from "@entities/Summary";

export class SummaryService {
    constructor(private summaryRepository: ISummaryRepository) {}

    async create(summary: Partial<ISummary>): Promise<ISummary> {
        return await this.summaryRepository.create(summary);
    }

    async findAll(): Promise<ISummary[]> {
        return await this.summaryRepository.findAll();
    }

    async findById(id: number): Promise<ISummary> {
        return await this.summaryRepository.findById(id);
    }
}
