import { IUpdateDocumentRepository, IDocument } from "@entities/Document";

export class UpdateDocumentService {
    private deleteDocumentRepository: IUpdateDocumentRepository;

    constructor(deleteDocumentRepository: IUpdateDocumentRepository) {
        this.deleteDocumentRepository = deleteDocumentRepository;
    }

    async update(id: number, document: Partial<IDocument>) {
        return this.deleteDocumentRepository.update(id, document);
    }
}
