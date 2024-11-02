import IRepository from "@domain/repositories/Repository";
export default class BaseListUseCase<T> {
    constructor(private repository: IRepository<T>) {}

    async execute(): Promise<T[]> {
        return this.repository.findAll();
    }
}
