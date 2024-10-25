import { IFindSummaryByIdRepository, ISummary } from "@entities/Summary";

export class FindSummaryByIdService {
    private findSummaryByIdRepository: IFindSummaryByIdRepository;

    constructor(findSummaryByIdRepository: IFindSummaryByIdRepository) {
        this.findSummaryByIdRepository = findSummaryByIdRepository;
    }

    async findById(id: number): Promise<ISummary> {
        return await this.findSummaryByIdRepository.findById(id);
    }
}
