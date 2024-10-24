import Document from "@models/Document";
import Collection from "@models/Collection";

import type { IDocument } from "shared/types/document";

export async function saveDocument(document: IDocument) {
    return await Document.create({
        ...document,
    });
}

export async function associateDocumentToCollection(
    collectionId: number,
    document,
) {
    const collection = await Collection.findByPk(collectionId);
    await collection.addDocument(document);
}
