import { UpdateCollectionRepository } from "@repositories/Collection/update-collection";
import { ICollection } from "@entities/Collection";

export class UpdateCollectionService {
    private updateCollectionRepository = new UpdateCollectionRepository();

    async updateCollection(
        id: number,
        collection: Partial<ICollection>,
    ): Promise<void> {
        return await this.updateCollectionRepository.update(id, collection);
    }
}
