import IConversationRepository from "@domain/repositories/ConversationRepository";

export default class AddMessageToConversationUseCase {
    constructor(private conversationRepository: IConversationRepository) {}

    async execute(conversationId: number, messageId: number): Promise<void> {
        return this.conversationRepository.addMessage(
            conversationId,
            messageId,
        );
    }
}
