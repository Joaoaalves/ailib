import Collection from "@models/Collection";
import { IAddDocumentToCollection } from "@entities/Collection";

export class AddDocumentToCollectionRepository
    implements IAddDocumentToCollection
{
    async addDocument(collectionId: number, document): Promise<void> {
        const collection = await Collection.findByPk(collectionId);
        await collection.addDocument(document);
    }
}
