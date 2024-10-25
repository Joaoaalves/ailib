import { ICollection, IUpdateCollectionRepository } from "@entities/Collection";

export class UpdateCollectionService {
    private updateCollectionRepository: IUpdateCollectionRepository;

    constructor(updateCollectionRepository: IUpdateCollectionRepository) {
        this.updateCollectionRepository = updateCollectionRepository;
    }

    async updateCollection(
        id: number,
        collection: Partial<ICollection>,
    ): Promise<void> {
        return await this.updateCollectionRepository.update(id, collection);
    }
}
