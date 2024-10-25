import { IDocument, IFindDocumentById } from "@entities/Document";
import Document from "@models/Document";
import { mapToEntity } from "../../utils/mapToEntity";

export class FindDocumentByIdRepository implements IFindDocumentById {
    async findById(id: number): Promise<IDocument | null> {
        const doc = await Document.findByPk(id);
        return mapToEntity<IDocument>(doc);
    }
}
