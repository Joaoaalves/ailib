import { RankedSearchResult } from "shared/types/qdrant";
import { getEmbeddings } from "./openai";
import { getMostRelevantItemsFromDocument } from "./qdrant";

export async function RAGFusion(queries: string[], filter: Object = {}) {
    const promises = queries.map((query) => simpleRAG(query, filter));

    const resultsArray = await Promise.all(promises);

    const results: any = resultsArray.flat();

    return rankResults(results);
}

async function simpleRAG(query: string, filter: Object = {}) {
    const embeddedMessage = await getEmbeddings(query);

    const res = await getMostRelevantItemsFromDocument(
        embeddedMessage,
        10,
        filter,
    );
    return res;
}

function rankResults(
    results: {
        id: string;
        documentId: string;
        page: number;
        score: number;
        chunkId: number;
    }[],
): RankedSearchResult[] {
    const rankedResults = new Map<number, RankedSearchResult>();

    for (const result of results) {
        if (rankedResults.has(result.page)) {
            const existingResult = rankedResults.get(result.page)!;
            existingResult.score += result.score;
            existingResult.occurrences += 1;
        } else {
            rankedResults.set(result.page, { ...result, occurrences: 1 });
        }
    }

    const sortedContents = Array.from(rankedResults.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

    return sortedContents;
}
