import Collection from "@domain/entities/Collection";
import CollectionRepository from "@domain/repositories/CollectionRepository";
import CollectionModel from "@infra/database/models/CollectionModel";
import DocumentModel from "@infra/database/models/DocumentModel";
import { Document } from "@domain/entities/Document";

export class CollectionRepositorySequelize implements CollectionRepository {
    async create(collection: Partial<Collection>): Promise<Collection> {
        const col = await CollectionModel.create(collection);
        return new Collection(col);
    }

    async findById(id: number): Promise<Collection | null> {
        const collection = await CollectionModel.findByPk(id);
        return collection ? new Collection(collection) : null;
    }

    async findAll(): Promise<Collection[]> {
        const collections = await CollectionModel.findAll({
            include: DocumentModel,
        });

        return collections.map(
            (collection) => new Collection(collection.dataValues),
        );
    }

    async update(id: number, collection: Partial<Collection>): Promise<void> {
        await CollectionModel.update(collection, { where: { id } });
    }

    async delete(id: number): Promise<void> {
        await CollectionModel.destroy({ where: { id } });
    }

    async addDocument(collectionId: number, documentId: number): Promise<void> {
        const collection = await CollectionModel.findByPk(collectionId);
        const document = await DocumentModel.findByPk(documentId);
        console.log("Adding document to collection");
        await collection.addDocument(document);
    }
}
