import { ISummary, ISummaryRepository } from "@domain/entities/Summary";
import Summary from "@infra/database/models/Summary";
import { mapToEntity } from "@infra/utils/mapToEntity";

export class SummaryRepository implements ISummaryRepository {
    async create(summary: Partial<ISummary>): Promise<ISummary> {
        const smr = await Summary.create(summary);
        return mapToEntity<ISummary>(smr);
    }

    async findAll(): Promise<ISummary[]> {
        const summarys = await Summary.findAll();

        return summarys.map((summary) => mapToEntity<ISummary>(summary));
    }

    async findById(id: number): Promise<ISummary | null> {
        const summary = await Summary.findByPk(id);
        return mapToEntity<ISummary>(summary);
    }
}
