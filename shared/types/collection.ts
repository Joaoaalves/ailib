import { IDocument } from "./document";

export interface ICollection {
    id: number;
    name: string;
    Documents?: IDocument[];
}
