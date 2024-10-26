import {
    IConversation,
    ICreateConversationRepository,
} from "@entities/Conversation";
import Conversation from "@models/Conversation";
import { mapToEntity } from "../../utils/mapToEntity";

export class CreateConversationRepository
    implements ICreateConversationRepository
{
    async create(conversation: Partial<IConversation>): Promise<IConversation> {
        const cnvs = await Conversation.create(conversation);
        return mapToEntity<IConversation>(cnvs);
    }
}
