import Collection from "@models/Collection";
import { ICollection, ICreateCollectionRepository } from "@entities/Collection";

export class CreateCollectionRepository implements ICreateCollectionRepository {
    async create(collection: ICollection): Promise<ICollection> {
        return await Collection.create(collection);
    }
}
