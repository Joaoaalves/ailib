import Collection from "@models/Collection";
import { ICollection, IUpdateCollectionRepository } from "@entities/Collection";

export class UpdateCollectionRepository implements IUpdateCollectionRepository {
    async update(id: number, collection: Partial<ICollection>): Promise<void> {
        await Collection.update(collection, { where: { id } });
    }
}
