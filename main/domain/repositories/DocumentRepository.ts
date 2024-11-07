import { Document } from "@domain/entities/Document";
import IRepository from "@domain/repositories/Repository";

export default interface IDocumentRepository extends IRepository<Document> {
    addSummary(documentId: number, summaryId: number): Promise<void>;
}
