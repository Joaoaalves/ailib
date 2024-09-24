import { HProcessPDF } from "../types/handlers";
import { countTokens, processChunks } from "./openai";

const MillionTokens = 1000000;

export async function processPDF({
    event,
    pages,
    document,
    collectionId,
    offset,
}: HProcessPDF) {
    try {
        const embeddingCost =
            (countTokens(pages.join(" "), "text-embedding-ada-002") * 0.02) /
            MillionTokens;

        event.sender.send("embedding_cost", embeddingCost);

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
