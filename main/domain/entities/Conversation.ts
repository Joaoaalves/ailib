export interface IConversation {
    id: number;
    title: string;
}

export interface ICreateConversationRepository {
    create(conversation: Partial<IConversation>): Promise<IConversation>;
}

export interface IFindAllConversationsRepository {
    findAll(): Promise<IConversation[]>;
}

export interface IAddMessageToConversationRepository {
    addMessage(conversationId: number, messageId: number): Promise<void>;
}

export interface IGetConversationMessagesRepository {
    getMessages(conversationId: number): Promise<IConversation>;
}

export interface IFindConversationByIdRepository {
    findByID(conversationId: number): Promise<IConversation>;
}

export interface IDeleteConversationRepository {
    delete(conversationId: number): Promise<void>;
}
