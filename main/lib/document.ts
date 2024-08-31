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
    document,
    collectionId,
    offset
}: HProcessPDF) {
    try {
        
        const embeddingCost =
            (countTokens(pages.join(" "), Models.embedding.tiktoken) *
                Models.embedding.pricingPer1M) /
            MillionTokens;
            
        event.sender.send("embedding_cost", embeddingCost);

        await ensureCollectionExists();

        await processChunks(event, pages, offset, {
            collectionId,
            bookName: document.name,
            documentId: document.id,
        });
        
    } catch (error) {
        console.error(error.message);
        throw new Error(error.message);
    }
}
