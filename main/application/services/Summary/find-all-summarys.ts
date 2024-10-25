import { ISummary, IFindAllSummarysRepository } from "@entities/Summary";

export class FindAllSummarysService {
    private findAllSummarysRepository: IFindAllSummarysRepository;

    constructor(findAllSummarysRepository: IFindAllSummarysRepository) {
        this.findAllSummarysRepository = findAllSummarysRepository;
    }

    async findAll(): Promise<ISummary[]> {
        return await this.findAllSummarysRepository.findAll();
    }
}
