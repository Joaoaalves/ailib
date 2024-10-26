import {
    IConversation,
    ICreateConversationRepository,
} from "@entities/Conversation";

export class CreateConversationService {
    private createConversationRepository: ICreateConversationRepository;

    constructor(createConversationRepository: ICreateConversationRepository) {
        this.createConversationRepository = createConversationRepository;
    }

    async create(conversation: Partial<IConversation>) {
        return this.createConversationRepository.create(conversation);
    }
}
