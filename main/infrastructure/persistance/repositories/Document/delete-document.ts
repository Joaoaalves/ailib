import { IDeleteDocumentRepository } from "@entities/Document";
import Document from "@models/Document";
import { deletePointsForDocumentId } from "../../../../lib/qdrant";

export class DeleteDocumentRepository implements IDeleteDocumentRepository {
    async delete(id: number): Promise<void> {
        await Document.destroy({
            where: {
                id: Number(id),
            },
        });

        await deletePointsForDocumentId(id);
    }
}
