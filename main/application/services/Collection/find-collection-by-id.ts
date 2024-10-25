import {
    ICollection,
    IFindCollectionByIdRepository,
} from "@entities/Collection";

export class FindCollectionByIdService {
    private findCollectionByIdRepository: IFindCollectionByIdRepository;

    constructor(findCollectionByIdRepository: IFindCollectionByIdRepository) {
        this.findCollectionByIdRepository = findCollectionByIdRepository;
    }
    async getCollectionById(id: number): Promise<ICollection | null> {
        return await this.findCollectionByIdRepository.findById(id);
    }
}
