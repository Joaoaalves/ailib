import IDocument from "@domain/entities/Document";
import IRepository  from "@domain/repositories/Repository";

export default interface IDocumentRepository extends IRepository<IDocument> {
    addSummary(documentId: number, summaryId: number): Promise<void>;
}