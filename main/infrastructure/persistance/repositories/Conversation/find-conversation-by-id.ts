import {
    IConversation,
    IFindConversationByIdRepository,
} from "@entities/Conversation";
import Conversation from "@models/Conversation";
import { mapToEntity } from "../../utils/mapToEntity";

export class FindConversationByIdRepository
    implements IFindConversationByIdRepository
{
    async findByID(conversationId: number): Promise<IConversation> {
        const conversation = await Conversation.findByPk(conversationId);
        return mapToEntity<IConversation>(conversation);
    }
}
