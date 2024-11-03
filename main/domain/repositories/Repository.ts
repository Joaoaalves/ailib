export default interface IRepository<T> {
    create(data: Partial<T>): Promise<T>;
    findById(id: number | string): Promise<T | null>;
    findAll?(filter?: Object): Promise<T[]>;
    update?(id: number | string, data: Partial<T>): Promise<void>;
    delete?(id: number): Promise<void>;
}
