import { IResult } from "@infra/adapters/QDrantAdapter";

export interface RankedSearchResult extends IResult {
    occurrences: number;
}

export interface IResultRanker {
    rank(results: IResult[]): RankedSearchResult[];
}

export class ResultRanker {
    rank(results: IResult[]): RankedSearchResult[] {
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
}
