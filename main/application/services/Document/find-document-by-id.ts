import { IDocument, IFindDocumentByIdRepository } from "@entities/Document";

export class FindDocumentByIdService {
    private findDocumentByIdRepository: IFindDocumentByIdRepository;

    constructor(findDocumentByIdRepository: IFindDocumentByIdRepository) {
        this.findDocumentByIdRepository = findDocumentByIdRepository;
    }

    async findById(id: number): Promise<IDocument | null> {
        return await this.findDocumentByIdRepository.findById(id);
    }
}
