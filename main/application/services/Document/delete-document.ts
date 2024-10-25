import { IDeleteDocumentRepository } from "@entities/Document";

export class DeleteDocumentService {
    private deleteDocumentRepository: IDeleteDocumentRepository;

    constructor(deleteDocumentRepository: IDeleteDocumentRepository) {
        this.deleteDocumentRepository = deleteDocumentRepository;
    }

    async delete(id: number): Promise<void> {
        return await this.deleteDocumentRepository.delete(id);
    }
}
