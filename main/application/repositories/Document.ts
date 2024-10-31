import { IDocument, IDocumentRepository } from "@domain/entities/Document";
import Summary from "@infra/database/models/SummaryModel";
import Document from "@infra/database/models/DocumentModel";
import { mapToEntity } from "@infra/utils/mapToEntity";

export class DocumentRepository implements IDocumentRepository {
    async create(document: Partial<IDocument>): Promise<IDocument> {
        const doc = await Document.create(document);
        return mapToEntity<IDocument>(doc);
    }

    async findById(id: number): Promise<IDocument | null> {
        const doc = await Document.findByPk(id);
        return mapToEntity<IDocument>(doc);
    }

    async update(id: number, document: Partial<IDocument>): Promise<void> {
        const doc = await Document.findByPk(id);

        if (doc) {
            await doc.update(document);
            await doc.save();
        }
    }

    async delete(id: number): Promise<void> {
        await Document.destroy({
            where: {
                id: Number(id),
            },
        });
    }

    async addSummary(documentId: number, summaryId: number): Promise<void> {
        const document = await Document.findByPk(documentId);
        const summary = await Summary.findByPk(summaryId);

        // @ts-expect-error
        await document.addSumary(summary);
    }
}
