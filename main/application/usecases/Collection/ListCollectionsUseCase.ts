import ICollectionRepository from "@domain/repositories/CollectionRepository";
import ICollection from "@domain/entities/Collection";

export class ListCollectionsUseCase {
    constructor(private collectionRepository: ICollectionRepository) {}

    async execute(): Promise<ICollection[]> {
        return await this.collectionRepository.findAll();
    }
}
