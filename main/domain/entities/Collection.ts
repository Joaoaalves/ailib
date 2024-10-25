import { IDocument } from "@entities/Document";

export interface ICollection {
    id: number;
    name: string;
    documents?: IDocument[];
}

export interface IFindAllCollectionsRepository {
    findAll(): Promise<ICollection[]>;
}

export interface IFindCollectionByIdRepository {
    findById(id: number): Promise<ICollection | null>;
}

export interface ICreateCollectionRepository {
    create(collection: Partial<ICollection>): Promise<ICollection>;
}

export interface IDeleteCollectionRepository {
    delete(id: number): Promise<void>;
}

export interface IUpdateCollectionRepository {
    update(id: number, collection: Partial<ICollection>): Promise<void>;
}

export interface IAddDocumentToCollection {
    addDocument(collectionId: number, document): Promise<void>;
}
