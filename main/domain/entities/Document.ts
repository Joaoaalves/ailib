import { ISummary } from "@entities/Summary";

export interface IDocument {
    id?: number;
    name: string;
    path: string;
    cover?: string;
    totalPages?: number;
    lastPageRead?: number;
    summaries?: ISummary[];
}

export interface IDocumentRepository {
    create(document: Partial<IDocument>): Promise<IDocument>;
    delete(id: number): Promise<void>;
    update(id: number, document: Partial<IDocument>): Promise<void>;
    findById(id: number): Promise<IDocument | null>;
    addDocument(documentId: number, summaryId: number): Promise<void>;
}
