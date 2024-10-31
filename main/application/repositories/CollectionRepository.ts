import ICollection from "@domain/entities/Collection";
import ICollectionRepository from "@domain/repositories/CollectionRepository";
import CollectionModel from "@infra/database/models/CollectionModel";
import DocumentModel from "@infra/database/models/DocumentModel";
import { mapToEntity } from "@infra/utils/mapToEntity";

export class CollectionRepository implements ICollectionRepository {
    async create(collection: Partial<ICollection>): Promise<ICollection> {
        const col = await CollectionModel.create(collection);
        return mapToEntity<ICollection>(col);
    }

    async findById(id: number): Promise<ICollection | null> {
        const collection = await CollectionModel.findByPk(id);
        return collection ? mapToEntity<ICollection>(collection) : null;
    }

    async findAll(): Promise<ICollection[]> {
        const collections = await CollectionModel.findAll({ include: DocumentModel });

        return collections.map((collection) =>
            mapToEntity<ICollection>(collection),
        );
    }

    async update(id: number, collection: Partial<ICollection>): Promise<void> {
        await CollectionModel.update(collection, { where: { id } });
    }

    async delete(id: number): Promise<void> {
        await CollectionModel.destroy({ where: { id } });
    }

    async addDocument(collectionId: number, documentId: number): Promise<void> {
        const collection = await CollectionModel.findByPk(collectionId);
        const document = await DocumentModel.findByPk(documentId);

        // @ts-expect-error
        await collection.addDocument(document);
    }
}
