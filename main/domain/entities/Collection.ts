import { IRepository } from "@domain/entities/Repository";
import { IDocument } from "@domain/entities/Document";

export interface ICollection {
    id: number;
    name: string;
    documents?: IDocument[];
}

export interface ICollectionRepository extends IRepository<ICollection> {
    addDocument(collectionId: number, document): Promise<void>;
}
