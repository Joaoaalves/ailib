import ISummary from "@domain/entities/Summary";
import ISummaryRepository from "@domain/repositories/SummaryRepository";
import SummaryModel from "@infra/database/models/SummaryModel";
import { mapToEntity } from "@infra/utils/mapToEntity";

export class SummaryRepositorySequelize implements ISummaryRepository {
    async create(summary: Partial<ISummary>): Promise<ISummary> {
        const smr = await SummaryModel.create(summary);
        return mapToEntity<ISummary>(smr);
    }

    async findAll(): Promise<ISummary[]> {
        const summarys = await SummaryModel.findAll();

        return summarys.map((summary) => mapToEntity<ISummary>(summary));
    }

    async findById(id: number): Promise<ISummary | null> {
        const summary = await SummaryModel.findByPk(id);
        return mapToEntity<ISummary>(summary);
    }
}
