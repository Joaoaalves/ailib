import { IAddMessageToConversationRepository } from "@entities/Conversation";

export class AddMessageToConversationService {
    private addMessageToConversationRepository: IAddMessageToConversationRepository;

    constructor(
        addMessageToConversationRepository: IAddMessageToConversationRepository,
    ) {
        this.addMessageToConversationRepository =
            addMessageToConversationRepository;
    }

    async addMessage(conversationId: number, messageId: number): Promise<void> {
        return this.addMessageToConversationRepository.addMessage(
            conversationId,
            messageId,
        );
    }
}
