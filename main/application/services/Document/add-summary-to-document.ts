import { IAddSummaryToDocumentRepository } from "@entities/Document";

export class AddSummaryToDocumentService {
    private addSummaryToDocumentRepository: IAddSummaryToDocumentRepository;

    constructor(
        addSummaryToDocumentRepository: IAddSummaryToDocumentRepository,
    ) {
        this.addSummaryToDocumentRepository = addSummaryToDocumentRepository;
    }

    async addSummary(documentId: number, summaryId: number) {
        return await this.addSummaryToDocumentRepository.addDocument(
            documentId,
            summaryId,
        );
    }
}
