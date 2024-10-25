import Document from "@models/Document";
import Collection from "@models/Collection";
import { IAddDocumentToCollection } from "@entities/Collection";

export class AddDocumentToCollectionRepository
    implements IAddDocumentToCollection
{
    async addDocument(collectionId: number, documentId: number): Promise<void> {
        const collection = await Collection.findByPk(collectionId);
        const document = await Document.findByPk(documentId);

        // @ts-expect-error
        await collection.addDocument(document);
    }
}
