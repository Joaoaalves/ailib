import { ISummary } from "./summary";

export interface IDocument {
    id?: number;
    name: string;
    path: string;
    cover?: string;
    totalPages?: number;
    lastPageRead?: number;
    summaries?: ISummary[];
}

export interface DocSearchResult {
    content: string;
    page: number;
    document: IDocument;
}

export interface ITextChunk {
    id?: number;
    text: string;
}
