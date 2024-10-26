export interface IMessage {
    id: number;
    content: string;
    role: "user" | "assistant" | "system";
}

export interface ICreateMessageRepository {
    create(message: Partial<IMessage>): Promise<IMessage>;
}

export interface IDeleteMessageRepository {
    delete(messageId: number): Promise<void>;
}
