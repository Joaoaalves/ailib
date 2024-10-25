import Document from "@models/Document";
import { ICreateDocumentRepository, IDocument } from "@entities/Document";
import { mapToEntity } from "../../utils/mapToEntity";

export class CreateDocumentRepository implements ICreateDocumentRepository {
    async create(document: Partial<IDocument>): Promise<IDocument> {
        const doc = await Document.create(document);
        return mapToEntity<IDocument>(doc);
    }
}
