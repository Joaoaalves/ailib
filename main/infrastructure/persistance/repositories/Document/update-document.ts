import { IDocument, IUpdateDocumentRepository } from "@entities/Document";
import Document from "@models/Document";

export class UpdateDocumentRepository implements IUpdateDocumentRepository {
    async update(id: number, document: Partial<IDocument>): Promise<void> {
        const doc = await Document.findByPk(id);

        if (doc) {
            await doc.update(document);
            await doc.save();
        }
    }
}
