import ICollectionRepository from "@domain/repositories/CollectionRepository";

export class AddDocumentToCollectionUseCase {
    constructor(private collectionRepository: ICollectionRepository) {}

    async execute(collectionId: number, documentId: number): Promise<void> {
        return await this.collectionRepository.addDocument(
            collectionId,
            documentId,
        );
    }
}
