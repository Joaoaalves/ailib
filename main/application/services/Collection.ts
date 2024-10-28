import { ICollection, ICollectionRepository } from "@entities/Collection";

export class CollectionService {
    constructor(private collectionRepository: ICollectionRepository) {}

    async createCollection(
        collection: Partial<ICollection>,
    ): Promise<ICollection> {
        return await this.collectionRepository.create(collection);
    }

    async getCollectionById(id: number): Promise<ICollection | null> {
        return await this.collectionRepository.findById(id);
    }

    async getAllCollections(): Promise<ICollection[]> {
        return await this.collectionRepository.findAll();
    }

    async updateCollection(
        id: number,
        collection: Partial<ICollection>,
    ): Promise<void> {
        return await this.collectionRepository.update(id, collection);
    }

    async deleteCollection(id: number): Promise<void> {
        await this.collectionRepository.delete(id);
    }

    async addDocument(collectionId: number, documentId: number): Promise<void> {
        return await this.collectionRepository.addDocument(
            collectionId,
            documentId,
        );
    }
}
