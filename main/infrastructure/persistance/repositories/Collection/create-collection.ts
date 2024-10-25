import Collection from "@models/Collection";
import { ICollection, ICreateCollectionRepository } from "@entities/Collection";
import { mapToEntity } from "../../utils/mapToEntity";

export class CreateCollectionRepository implements ICreateCollectionRepository {
    async create(collection: Partial<ICollection>): Promise<ICollection> {
        const col = await Collection.create(collection);
        return mapToEntity<ICollection>(col);
    }
}
