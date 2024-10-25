import Summary from "@models/Summary";
import Document from "@models/Document";
import { IAddSummaryToDocumentRepository } from "@entities/Document";

export class AddSummaryToDocumentRepository
    implements IAddSummaryToDocumentRepository
{
    async addDocument(documentId: number, summaryId: number): Promise<void> {
        const document = await Document.findByPk(documentId);
        const summary = await Summary.findByPk(summaryId);

        // @ts-expect-error
        await document.addSumary(summary);
    }
}
