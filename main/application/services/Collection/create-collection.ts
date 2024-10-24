import { CreateCollectionRepository } from "@repositories/Collection/create-collection";
import { ICollection } from "@entities/Collection";

export class CreateCollectionService {
    private createCollectionRepository = new CreateCollectionRepository();

    async createCollection(collection: ICollection): Promise<ICollection> {
        return await this.createCollectionRepository.create(collection);
    }
}
