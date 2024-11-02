import IConversation from "@domain/entities/Conversation";
import IConversationRepository from "@domain/repositories/ConversationRepository";

export default class GetConversationMessagesUseCase {
    constructor(private conversationRepository: IConversationRepository) {}

    async execute(conversationId: number): Promise<IConversation> {
        return this.conversationRepository.getMessages(conversationId);
    }
}
