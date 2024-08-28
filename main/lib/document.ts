import { HProcessPDF } from "../types/handlers";
import { ensureCollectionExists } from "./qdrant";
import { extractCover, savePdfToStorage } from "./file";
import { associateDocumentToCollection, saveDocument } from "./data";
import { countTokens, processChunks } from "./openai";

import { Models } from "./openai";

const MillionTokens = 1000000;

export async function processPDF({
    event,
    pages,
    pdfPath,
    bookName,
    collectionId,
}: HProcessPDF) {
    try {
        const storagePdfPath = await savePdfToStorage(pdfPath, bookName);
        const totalPages = pages.length;

        const embeddingCost =
            (countTokens(pages.join(" "), Models.embedding.tiktoken) *
                Models.embedding.pricingPer1M) /
            MillionTokens;
        event.sender.send("embedding_cost", embeddingCost);

        await ensureCollectionExists();

        const cover = await extractCover(pdfPath, bookName);

        const document = await saveDocument({
            name: bookName,
            path: storagePdfPath,
            cover,
            totalPages,
        });
        await associateDocumentToCollection(collectionId, document);

        await processChunks(event, pages, {
            collectionId,
            bookName,
            documentId: document.id,
        });

        event.sender.send("embedding_complete");
    } catch (error) {
        console.error(error.message);
        throw new Error(error.message);
    }
}
