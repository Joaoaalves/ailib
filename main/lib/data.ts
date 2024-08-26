import Document from "../db/document";
import Collection from "../db/collection";

import type { IDocument } from "shared/types/document";

export async function saveDocument(document : IDocument) {
    return await Document.create({
        ...document
    });
}

export async function associateDocumentToCollection(collectionId, document) {
    const collection = await Collection.findByPk(collectionId);
    await collection.addDocument(document);
}