import {
    ICollection,
    ICollectionRepository,
} from "@domain/entities/Collection";
import Collection from "@infra/database/models/Collection";
import Document from "@infra/database/models/Document";
import { mapToEntity } from "@infra/utils/mapToEntity";

export class CollectionRepository implements ICollectionRepository {
    async create(collection: Partial<ICollection>): Promise<ICollection> {
        const col = await Collection.create(collection);
        return mapToEntity<ICollection>(col);
    }

    async findById(id: number): Promise<ICollection | null> {
        const collection = await Collection.findByPk(id);
        return collection ? mapToEntity<ICollection>(collection) : null;
    }

    async findAll(): Promise<ICollection[]> {
        const collections = await Collection.findAll({ include: Document });

        return collections.map((collection) =>
            mapToEntity<ICollection>(collection),
        );
    }

    async update(id: number, collection: Partial<ICollection>): Promise<void> {
        await Collection.update(collection, { where: { id } });
    }

    async delete(id: number): Promise<void> {
        await Collection.destroy({ where: { id } });
    }

    async addDocument(collectionId: number, documentId: number): Promise<void> {
        const collection = await Collection.findByPk(collectionId);
        const document = await Document.findByPk(documentId);

        // @ts-expect-error
        await collection.addDocument(document);
    }
}
