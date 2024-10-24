import Collection from "@models/Collection";
import { IDeleteCollectionRepository } from "@entities/Collection";
export class DeleteCollectionRepository implements IDeleteCollectionRepository {
    async delete(id: number): Promise<void> {
        await Collection.destroy({ where: { id } });
    }
}
