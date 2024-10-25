export interface ISummary {
    id?: number;
    title: string;
    text?: string;
    path: string;
    summaryType: "page" | "chapter" | "file" | "interval";
    page?: number;
    chapter?: number;
    createdAt: Date;
}

export interface IFindAllSummarysRepository {
    findAll(): Promise<ISummary[]>;
}

export interface IFindSummaryByIdRepository {
    findById(id: number): Promise<ISummary | null>;
}

export interface ICreateSummaryRepository {
    create(summary: Partial<ISummary>): Promise<ISummary>;
}
