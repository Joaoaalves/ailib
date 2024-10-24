import { DeleteCollectionRepository } from "@repositories/Collection/delete-collection";

export class DeleteCollectionService {
    private deleteCollectionRepository = new DeleteCollectionRepository();

    async deleteCollection(id: number): Promise<void> {
        await this.deleteCollectionRepository.delete(id);
    }
}
