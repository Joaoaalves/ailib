import  ICollection from "@domain/entities/Collection";
import IRepository  from "@domain/repositories/Repository";

export default interface ICollectionRepository extends IRepository<ICollection> {
    addDocument(collectionId: number, document): Promise<void>;
}