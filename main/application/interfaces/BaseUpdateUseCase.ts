import IRepository from "@domain/repositories/Repository";

export default abstract class BaseUpdateUseCase<T> {
    constructor(protected repository: IRepository<T>) {}

    async execute(id: number, data: Partial<T>) {
        return this.repository.update(id, data);
    }
}
