export interface IMessage {
    id: number;
    content: string;
    role: "user" | "assistant" | "system";
}

export interface IMessageRepository {
    create(message: Partial<IMessage>): Promise<IMessage>;
    delete(messageId: number): Promise<void>;
}
