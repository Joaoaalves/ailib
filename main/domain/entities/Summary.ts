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

export interface ISummaryRepository {
    findAll(): Promise<ISummary[]>;
    findById(id: number): Promise<ISummary | null>;
    create(summary: Partial<ISummary>): Promise<ISummary>;
}
