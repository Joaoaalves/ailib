import { ICreateSummaryRepository, ISummary } from "@entities/Summary";

export class CreateSummaryService {
    private createSummaryRepository: ICreateSummaryRepository;

    constructor(createSummaryRepository: ICreateSummaryRepository) {
        this.createSummaryRepository = createSummaryRepository;
    }

    async create(summary: Partial<ISummary>): Promise<ISummary> {
        return await this.createSummaryRepository.create(summary);
    }
}
