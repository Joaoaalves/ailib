import { IDocument } from "@entities/Document";
import { AddDocumentToCollectionRepository } from "@repositories/Collection/add-document-to-collection";

export class AddDocumentToCollectionService {
    private addDocumentToCollectionRepository =
        new AddDocumentToCollectionRepository();

    async addDocument(collectionId: number, documentId: number): Promise<void> {
        return await this.addDocumentToCollectionRepository.addDocument(
            collectionId,
            documentId,
        );
    }
}
