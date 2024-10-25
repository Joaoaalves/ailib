import {
    ICollection,
    IFindAllCollectionsRepository,
} from "@entities/Collection";

export class FindAllCollectionsService {
    private findAllCollectionsRepository: IFindAllCollectionsRepository;

    constructor(findAllCollectionsRepository: IFindAllCollectionsRepository) {
        this.findAllCollectionsRepository = findAllCollectionsRepository;
    }

    async getAllCollections(): Promise<ICollection[]> {
        return await this.findAllCollectionsRepository.findAll();
    }
}
