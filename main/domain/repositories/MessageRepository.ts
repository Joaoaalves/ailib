import IMessage from "@domain/entities/Message";
import IRepository from "@domain/repositories/Repository";

export default interface IMessageRepository extends IRepository<IMessage> {}
