export interface IDocument {
    id?: number;
    name: string;
    path: string;
    cover: string;
    totalPages: number;
    lastPageRead?: number;
}
