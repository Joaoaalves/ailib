import { IRepository } from "./Repository";

export interface IMessage {
    id?: number;
    content: string;
    role: "user" | "assistant" | "system";
}

export interface IMessageRepository extends IRepository<IMessage> {}
