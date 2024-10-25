import { IDeleteCollectionRepository } from "@entities/Collection";
export class DeleteCollectionService {
    private deleteCollectionRepository: IDeleteCollectionRepository;

    constructor(deleteCollectionRepository: IDeleteCollectionRepository) {
        this.deleteCollectionRepository = deleteCollectionRepository;
    }

    async deleteCollection(id: number): Promise<void> {
        await this.deleteCollectionRepository.delete(id);
    }
}
