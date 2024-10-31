export default interface IRAGRepository {
    summarizePages(
        pages: string[],
        lastSummary: string,
        model: string,
    ): Promise<string | null>;
    createHypotheticalDocument(query: string, model: string): Promise<string>;
    generateQueries(query: string, model: string): Promise<string>;
}