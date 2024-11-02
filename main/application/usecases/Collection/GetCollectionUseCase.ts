import ICollectionRepository from "@domain/repositories/CollectionRepository";
import ICollection from "@domain/entities/Collection";

export class GetCollectionUseCase {
    constructor(private collectionRepository: ICollectionRepository) {}

    async execute(collectionId: number): Promise<ICollection> {
        return await this.collectionRepository.findById(collectionId);
    }
}
