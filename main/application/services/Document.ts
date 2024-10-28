import { IDocument, IDocumentRepository } from "@entities/Document";

export class DocumentService {
    constructor(private documentRepository: IDocumentRepository) {}

    async create(document: Partial<IDocument>): Promise<IDocument | null> {
        return await this.documentRepository.create(document);
    }

    async findById(id: number): Promise<IDocument | null> {
        return await this.documentRepository.findById(id);
    }

    async update(id: number, document: Partial<IDocument>) {
        return this.documentRepository.update(id, document);
    }

    async delete(id: number): Promise<void> {
        return await this.documentRepository.delete(id);
    }

    async addSummary(documentId: number, summaryId: number) {
        return await this.documentRepository.addDocument(documentId, summaryId);
    }
}
