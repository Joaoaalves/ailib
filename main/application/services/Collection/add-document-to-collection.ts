import { IAddDocumentToCollection } from "@entities/Collection";

export class AddDocumentToCollectionService {
    private addDocumentToCollectionRepository: IAddDocumentToCollection;

    constructor(addDocumentToCollectionRepository: IAddDocumentToCollection) {
        this.addDocumentToCollectionRepository =
            addDocumentToCollectionRepository;
    }

    async addDocument(collectionId: number, documentId: number): Promise<void> {
        return await this.addDocumentToCollectionRepository.addDocument(
            collectionId,
            documentId,
        );
    }
}
