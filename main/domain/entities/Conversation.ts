import { IRepository } from "./Repository";

export interface IConversation {
    id: number;
    title: string;
}

export interface IConversationRepository extends IRepository<IConversation> {
    addMessage(conversationId: number, messageId: number): Promise<void>;
    getMessages(conversationId: number): Promise<IConversation>;
}
