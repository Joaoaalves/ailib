import { IConversation, IConversationRepository } from "@entities/Conversation";

export class ConversationService {
    constructor(private conversationRepository: IConversationRepository) {}

    async create(conversation: Partial<IConversation>) {
        return this.conversationRepository.create(conversation);
    }

    async findAll(): Promise<IConversation[]> {
        return this.conversationRepository.findAll();
    }

    async findById(conversationId: number): Promise<IConversation> {
        return this.conversationRepository.findByID(conversationId);
    }

    async delete(conversationId: number): Promise<void> {
        return this.conversationRepository.delete(conversationId);
    }

    async addMessage(conversationId: number, messageId: number): Promise<void> {
        return this.conversationRepository.addMessage(
            conversationId,
            messageId,
        );
    }

    async getMessages(conversationId: number): Promise<IConversation> {
        return this.conversationRepository.getMessages(conversationId);
    }
}
