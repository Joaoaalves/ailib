import ICollectionRepository from "@domain/repositories/CollectionRepository";
import ICollection from "@domain/entities/Collection";

export class CreateCollectionUseCase {
    constructor(private collectionRepository: ICollectionRepository) {}

    async execute(collectionData: Partial<ICollection>): Promise<ICollection> {
        return await this.collectionRepository.create(collectionData);
    }
}
