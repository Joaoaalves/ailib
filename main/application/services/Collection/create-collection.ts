import { ICollection, ICreateCollectionRepository } from "@entities/Collection";

export class CreateCollectionService {
    private createCollectionRepository: ICreateCollectionRepository;

    constructor(createCollectionRepository: ICreateCollectionRepository) {
        this.createCollectionRepository = createCollectionRepository;
    }

    async createCollection(
        collection: Partial<ICollection>,
    ): Promise<ICollection> {
        return await this.createCollectionRepository.create(collection);
    }
}
