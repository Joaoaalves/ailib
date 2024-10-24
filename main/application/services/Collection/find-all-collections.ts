import { FindAllCollectionsRepository } from "@repositories/Collection/find-all-collections";
import { ICollection } from "@entities/Collection";

export class FindAllCollectionsService {
    private findAllCollectionsRepository = new FindAllCollectionsRepository();

    async getAllCollections(): Promise<ICollection[]> {
        return await this.findAllCollectionsRepository.findAll();
    }
}
