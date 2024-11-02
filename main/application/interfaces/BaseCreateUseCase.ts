import IRepository from "@domain/repositories/Repository";

export default class BaseCreateUseCase<T> {
    constructor(private repository: IRepository<T>) {}

    async execute(data: Partial<T>): Promise<T> {
        return this.repository.create(data);
    }
}
