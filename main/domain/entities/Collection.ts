import { IDocument } from "@entities/Document";

export interface ICollection {
    id: number;
    name: string;
    documents?: IDocument[];
}

export interface ICollectionRepository {
    create(collection: Partial<ICollection>): Promise<ICollection>;
    findAll(): Promise<ICollection[]>;
    findById(id: number): Promise<ICollection | null>;
    update(id: number, collection: Partial<ICollection>): Promise<void>;
    delete(id: number): Promise<void>;
    addDocument(collectionId: number, document): Promise<void>;
}
