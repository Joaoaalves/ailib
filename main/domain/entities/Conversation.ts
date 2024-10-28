export interface IConversation {
    id: number;
    title: string;
}

export interface IConversationRepository {
    create(conversation: Partial<IConversation>): Promise<IConversation>;
    findAll(): Promise<IConversation[]>;
    addMessage(conversationId: number, messageId: number): Promise<void>;
    getMessages(conversationId: number): Promise<IConversation>;
    findByID(conversationId: number): Promise<IConversation>;
    delete(conversationId: number): Promise<void>;
}
