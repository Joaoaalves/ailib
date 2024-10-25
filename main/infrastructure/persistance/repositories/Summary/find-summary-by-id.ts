import { ISummary, IFindSummaryByIdRepository } from "@entities/Summary";
import Summary from "@models/Summary";
import { mapToEntity } from "../../utils/mapToEntity";

export class FindSummaryByIdRepository implements IFindSummaryByIdRepository {
    async findById(id: number): Promise<ISummary | null> {
        const summary = await Summary.findByPk(id);
        return mapToEntity<ISummary>(summary);
    }
}
