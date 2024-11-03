import IDocument from "@domain/entities/Document";
import IDocumentRepository from "@domain/repositories/DocumentRepository";
import SummaryModel from "@infra/database/models/SummaryModel";
import DocumentModel from "@infra/database/models/DocumentModel";
import { mapToEntity } from "@infra/adapters/SequelizeReponseAdapter";

export class DocumentRepositorySequelize implements IDocumentRepository {
    async create(document: Partial<IDocument>): Promise<IDocument> {
        const doc = await DocumentModel.create(document);
        return mapToEntity<IDocument>(doc);
    }

    async findById(id: number): Promise<IDocument | null> {
        const doc = await DocumentModel.findByPk(id);
        return mapToEntity<IDocument>(doc);
    }

    async update(id: number, document: Partial<IDocument>): Promise<void> {
        const doc = await DocumentModel.findByPk(id);

        if (doc) {
            await doc.update(document);
            await doc.save();
        }
    }

    async delete(id: number): Promise<void> {
        await DocumentModel.destroy({
            where: {
                id: Number(id),
            },
        });
    }

    async addSummary(documentId: number, summaryId: number): Promise<void> {
        const document = await DocumentModel.findByPk(documentId);
        const summary = await SummaryModel.findByPk(summaryId);

        // @ts-expect-error
        await DocumentModel.addSumary(summary);
    }
}
