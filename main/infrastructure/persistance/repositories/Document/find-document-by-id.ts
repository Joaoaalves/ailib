import { IDocument, IFindDocumentByIdRepository } from "@entities/Document";
import Document from "@models/Document";
import { mapToEntity } from "../../utils/mapToEntity";

export class FindDocumentByIdRepository implements IFindDocumentByIdRepository {
    async findById(id: number): Promise<IDocument | null> {
        const doc = await Document.findByPk(id);
        return mapToEntity<IDocument>(doc);
    }
}
