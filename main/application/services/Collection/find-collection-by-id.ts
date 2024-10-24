import { ICollection } from "@entities/Collection";
import { FindCollectionByIdRepository } from "@repositories/Collection/find-collection-by-id";

export class FindCollectionByIdService {
    private findCollectionByIdRepository = new FindCollectionByIdRepository();

    async getCollectionById(id: number): Promise<ICollection | null> {
        return await this.findCollectionByIdRepository.findById(id);
    }
}
