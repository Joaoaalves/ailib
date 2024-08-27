export interface IDocument {
    id?: number;
    name: string;
    path: string;
    cover?: string;
    totalPages?: number;
    lastPageRead?: number;
}

export interface DocSearchResult {
    content: string;
    page: number;
    document: IDocument;
}
