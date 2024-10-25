import { ISummary, IFindAllSummarysRepository } from "@entities/Summary";
import Summary from "@models/Summary";
import { mapToEntity } from "../../utils/mapToEntity";

export class FindAllSummarysRepository implements IFindAllSummarysRepository {
    async findAll(): Promise<ISummary[]> {
        const summarys = await Summary.findAll();

        return summarys.map((summary) => mapToEntity<ISummary>(summary));
    }
}
