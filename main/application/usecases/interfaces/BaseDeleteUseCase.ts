import IRepository from "@domain/repositories/Repository";

export default class BaseDeleteUseCase<T> {
    constructor(private repository: IRepository<T>) {}

    async execute(id: number): Promise<void> {
        this.repository.delete(id);
    }
}
