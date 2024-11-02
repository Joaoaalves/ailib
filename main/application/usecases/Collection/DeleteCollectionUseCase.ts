import ICollectionRepository from "@domain/repositories/CollectionRepository";

export class DeleteCollectionUseCase {
    constructor(private collectionRepository: ICollectionRepository) {}

    async execute(collectionId: number): Promise<void> {
        await this.collectionRepository.delete(collectionId);
    }
}
