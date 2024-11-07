import ISummary from "./Summary";

export interface IDocument {
    id?: number;
    name: string;
    path: string;
    cover?: string;
    totalPages?: number;
    lastPageRead?: number;
    summaries?: ISummary[];
}

export class Document {
    id?: number;
    name: string;
    path: string;
    cover?: string;
    totalPages?: number;
    lastPageRead?: number;
    summaries?: ISummary[];

    constructor(data: IDocument) {
        Object.assign(this, data);
    }

    public setLastPageRead(page: number): void {
        if (page > 0 && page <= (this.totalPages || 0)) {
            this.lastPageRead = page;
        } else {
            throw new Error("Invalid page number.");
        }
    }

    public setCover(coverPath: string): void {
        this.cover = coverPath;
    }
}
