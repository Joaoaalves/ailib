import { Document } from "@domain/entities/Document";
import IDocumentRepository from "@domain/repositories/DocumentRepository";
import SummaryModel from "@infra/database/models/SummaryModel";
import DocumentModel from "@infra/database/models/DocumentModel";

export class DocumentRepositorySequelize implements IDocumentRepository {
    async create(document: Partial<Document>): Promise<Document> {
        const doc = await DocumentModel.create(document);
        return new Document(doc.dataValues);
    }

    async findById(id: number): Promise<Document | null> {
        const doc = await DocumentModel.findByPk(id);
        return new Document(doc.dataValues);
    }

    async update(id: number, document: Partial<Document>): Promise<void> {
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
        if (document) await document.addSummary(summary);
    }
}
