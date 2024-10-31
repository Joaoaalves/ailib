import { ISummary } from "@domain/entities/Summary";
import { IRepository } from "./Repository";

export interface IDocument {
    id?: number;
    name: string;
    path: string;
    cover?: string;
    totalPages?: number;
    lastPageRead?: number;
    summaries?: ISummary[];
}

export interface IDocumentRepository extends IRepository<IDocument> {
    addSummary(documentId: number, summaryId: number): Promise<void>;
}
