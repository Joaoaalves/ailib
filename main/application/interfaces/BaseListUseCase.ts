import IRepository from "@domain/repositories/Repository";
export default class BaseListUseCase<T> {
    constructor(private repository: IRepository<T>) {}

    async execute(filter?: Object): Promise<T[]> {
        return this.repository.findAll(filter);
    }
}
