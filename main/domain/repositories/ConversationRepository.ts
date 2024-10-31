import IConversation from "@domain/entities/Conversation";
import IRepository  from "@domain/repositories/Repository";

export default interface IConversationRepository extends IRepository<IConversation> {
    addMessage(conversationId: number, messageId: number): Promise<void>;
    getMessages(conversationId: number): Promise<IConversation>;
}