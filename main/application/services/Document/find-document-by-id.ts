import { IDocument, IFindDocumentById } from "@entities/Document";

export class FindDocumentByIdService {
    private findDocumentByIdRepository: IFindDocumentById;

    constructor(findDocumentByIdRepository: IFindDocumentById) {
        this.findDocumentByIdRepository = findDocumentByIdRepository;
    }

    async getDocumentById(id: number): Promise<IDocument | null> {
        return await this.findDocumentByIdRepository.findById(id);
    }
}
