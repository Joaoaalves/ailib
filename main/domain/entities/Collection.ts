import IDocument  from "@domain/entities/Document";

export default interface ICollection {
    id: number;
    name: string;
    documents?: IDocument[];
}