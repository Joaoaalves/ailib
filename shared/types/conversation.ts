export interface IMessage{
    id?: number;
    role: "assistant" | "user" | "system",
    content: string;
    updatedAt?: Date;
    createdAt?: Date;
}

export interface IConversation{
    id: number;
    title: string;
    updatedAt?: Date;
    createdAt?: Date;
    Messages: IMessage[];
}