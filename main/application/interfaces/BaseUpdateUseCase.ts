import IRepository from "@domain/repositories/Repository";

export default class BaseUpdateUseCase<T> {
    constructor(private repository: IRepository<T>) {}

    async execute(id: number, data: Partial<T>) {
        return this.repository.update(id, data);
    }
}
