import Collection from "@models/Collection";
import {
    ICollection,
    IFindCollectionByIdRepository,
} from "@entities/Collection";
import { mapToEntity } from "../../utils/mapToEntity";

export class FindCollectionByIdRepository
    implements IFindCollectionByIdRepository
{
    async findById(id: number): Promise<ICollection | null> {
        const collection = await Collection.findByPk(id);
        return collection ? mapToEntity<ICollection>(collection) : null;
    }
}
