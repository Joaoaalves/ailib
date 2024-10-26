import { IDeleteConversationRepository } from "@entities/Conversation";

export class DeleteConversationService {
    private deleteConversationRepository: IDeleteConversationRepository;

    constructor(deleteConversationRepository: IDeleteConversationRepository) {
        this.deleteConversationRepository = deleteConversationRepository;
    }

    async delete(conversationId: number): Promise<void> {
        return this.deleteConversationRepository.delete(conversationId);
    }
}
