import { RankedSearchResult } from "shared/types/qdrant"
import { getEmbeddings } from "./openai"
import { getMostRelevantItemsFromDocument } from "./qdrant"

export async function RAGFusion(
    queries:string[],
    documentId: number
){
    const results= []

    for(let i = 0; i < queries.length ; i++){
        const ragResult = await SimpleRAG(queries[i], documentId)
        results.push(...ragResult)
    }
   
    return rankResults(results);
}

async function SimpleRAG(query:string, documentId:number){
    const embeddedMessage = await getEmbeddings(query)
    const res =  await getMostRelevantItemsFromDocument( documentId , embeddedMessage, 5)
    return res
}


function rankResults(results: { id: string; content: string; bookName: string; page: number; score: number }[]): RankedSearchResult[] {
    const rankedResults = new Map<string, RankedSearchResult>();

    for (const result of results) {
        if (rankedResults.has(result.id)) {
            const existingResult = rankedResults.get(result.id)!;
            existingResult.score += result.score;
            existingResult.occurrences += 1;
        } else {
            rankedResults.set(result.id, { ...result, occurrences: 1 });
        }
    }

    const sortedContents = Array.from(rankedResults.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        

    return sortedContents;
}
