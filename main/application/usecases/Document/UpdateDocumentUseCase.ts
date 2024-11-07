import IDocumentRepository from "@domain/repositories/DocumentRepository";
import { Document } from "@domain/entities/Document";

export default class UpdateDocumentUseCase {
    constructor(private documentRepository: IDocumentRepository) {}

    async execute(id: number, data: Partial<Document>): Promise<void> {
        const document = await this.documentRepository.findById(id);

        if (!document) {
            throw new Error("Document not found.");
        }

        if (data.lastPageRead !== undefined) {
            document.setLastPageRead(data.lastPageRead);
        }

        await this.documentRepository.update(id, { ...document, ...data });
    }
}
