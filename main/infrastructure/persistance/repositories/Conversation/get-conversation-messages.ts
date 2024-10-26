import {
    IConversation,
    IGetConversationMessagesRepository,
} from "@entities/Conversation";
import { IMessage } from "@entities/Message";
import Conversation from "@models/Conversation";
import Message from "@models/Message";
import { mapToEntity } from "../../utils/mapToEntity";

export class GetConversationMessagesRepository
    implements IGetConversationMessagesRepository
{
    async getMessages(conversationId: number): Promise<IConversation> {
        const conversation = await Conversation.findByPk(conversationId, {
            include: Message,
            order: [["id", "ASC"]],
        });

        return mapToEntity<IConversation>(conversation);
    }
}
