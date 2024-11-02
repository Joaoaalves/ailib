import ICollectionRepository from "@domain/repositories/CollectionRepository";
import ICollection from "@domain/entities/Collection";

export class UpdateCollectionUseCase {
    constructor(private collectionRepository: ICollectionRepository) {}

    async execute(
        collectionId: number,
        collectionData: Partial<ICollection>,
    ): Promise<void> {
        await this.collectionRepository.update(collectionId, collectionData);
    }
}
