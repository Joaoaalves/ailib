import Collection from "@models/Collection";
import Document from "@models/Document";
import {
    ICollection,
    IFindAllCollectionsRepository,
} from "@entities/Collection";
import { mapToEntity } from "../../utils/mapToEntity";

export class FindAllCollectionsRepository
    implements IFindAllCollectionsRepository
{
    async findAll(): Promise<ICollection[]> {
        const collections = await Collection.findAll({ include: Document });

        return collections.map((collection) =>
            mapToEntity<ICollection>(collection),
        );
    }
}
