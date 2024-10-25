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

export interface ICreateDocumentRepository {
    create(document: Partial<IDocument>): Promise<IDocument>;
}

export interface IDeleteDocumentRepository {
    delete(id: number): Promise<void>;
}

export interface IUpdateDocumentRepository {
    update(id: number, document: Partial<IDocument>): Promise<void>;
}

export interface IFindDocumentByIdRepository {
    findById(id: number): Promise<IDocument | null>;
}

export interface IAddSummaryToDocumentRepository {
    addDocument(documentId: number, summaryId: number): Promise<void>;
}
