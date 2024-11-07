import { Document } from "@domain/entities/Document";

interface ICollection {
    id: number;
    name: string;
    documents?: Document[];
}

export default class Collection {
    id: number;
    name: string;
    documents?: Document[];

    constructor(data: ICollection) {
        Object.assign(this, data);
    }

    public addDocument(document: Document): void {
        if (!this.documents) {
            this.documents = [];
        }

        this.documents.push(document);
    }
}
