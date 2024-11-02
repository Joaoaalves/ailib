import IDocumentRepository from "@domain/repositories/DocumentRepository";

export default class AddSummaryToDocumentUseCase {
    constructor(private documentRepository: IDocumentRepository) {}

    async execute(documentId: number, summaryId: number): Promise<void> {
        return this.documentRepository.addSummary(documentId, summaryId);
    }
}
