import {
    IConversation,
    IFindAllConversationsRepository,
} from "@entities/Conversation";

export class FindAllConversationsService {
    private findAllConversationsRepository: IFindAllConversationsRepository;

    constructor(
        findAllConversationsRepository: IFindAllConversationsRepository,
    ) {
        this.findAllConversationsRepository = findAllConversationsRepository;
    }

    async findAll(): Promise<IConversation[]> {
        return this.findAllConversationsRepository.findAll();
    }
}
