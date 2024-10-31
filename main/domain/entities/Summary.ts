import { IRepository } from "./Repository";

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

export interface ISummaryRepository extends IRepository<ISummary> {}
