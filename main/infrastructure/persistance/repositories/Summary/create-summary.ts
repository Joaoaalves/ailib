import { ISummary, ICreateSummaryRepository } from "@entities/Summary";
import Summary from "@models/Summary";
import { mapToEntity } from "../../utils/mapToEntity";

export class CreateSummaryRepository implements ICreateSummaryRepository {
    async create(summary: Partial<ISummary>): Promise<ISummary> {
        const smr = await Summary.create(summary);
        return mapToEntity<ISummary>(smr);
    }
}
