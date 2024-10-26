import {
    IConversation,
    IGetConversationMessagesRepository,
} from "@entities/Conversation";

export class GetConversationMessagesService {
    private getConversationMessagesRepository: IGetConversationMessagesRepository;

    constructor(
        getConversationMessagesRepository: IGetConversationMessagesRepository,
    ) {
        this.getConversationMessagesRepository =
            getConversationMessagesRepository;
    }

    async getMessages(conversationId: number): Promise<IConversation> {
        return this.getConversationMessagesRepository.getMessages(
            conversationId,
        );
    }
}
