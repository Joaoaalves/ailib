import { IAddMessageToConversationRepository } from "@entities/Conversation";
import Conversation from "@models/Conversation";
import Message from "@models/Message";

export class AddMessageToConversationRepository
    implements IAddMessageToConversationRepository
{
    async addMessage(conversationId: number, messageId: number): Promise<void> {
        const conversation = await Conversation.findByPk(conversationId);
        const message = await Message.findByPk(messageId);

        await conversation.addMessage(message);
    }
}
