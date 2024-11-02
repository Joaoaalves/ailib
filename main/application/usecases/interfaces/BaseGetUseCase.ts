import IRepository from "@domain/repositories/Repository";

export default class BaseGetUseCase<T> {
    constructor(private repository: IRepository<T>) {}

    async execute(id: number): Promise<T> {
        return this.repository.findById(id);
    }
}
