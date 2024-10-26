import {
    IConversation,
    IFindConversationByIdRepository,
} from "@entities/Conversation";

export class FindConversationByIdService {
    private findConversationByIdRepository: IFindConversationByIdRepository;

    constructor(
        findConversationByIdRepository: IFindConversationByIdRepository,
    ) {
        this.findConversationByIdRepository = findConversationByIdRepository;
    }

    async findById(conversationId: number): Promise<IConversation> {
        return this.findConversationByIdRepository.findByID(conversationId);
    }
}
