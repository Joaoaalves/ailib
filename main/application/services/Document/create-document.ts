import { IDocument, ICreateDocumentRepository } from "@entities/Document";

export class CreateDocumentService {
    private createDocumentRepository: ICreateDocumentRepository;

    constructor(createDocumentRepository: ICreateDocumentRepository) {
        this.createDocumentRepository = createDocumentRepository;
    }

    async create(document: Partial<IDocument>): Promise<IDocument | null> {
        return await this.createDocumentRepository.create(document);
    }
}
