import Conversation from "@models/Conversation";
import { mapToEntity } from "../../utils/mapToEntity";
import {
    IConversation,
    IFindAllConversationsRepository,
} from "@entities/Conversation";

export class FindAllConversationsRepository
    implements IFindAllConversationsRepository
{
    async findAll(): Promise<IConversation[]> {
        const conversations = await Conversation.findAll();
        return conversations.map((conversation) =>
            mapToEntity<IConversation>(conversation),
        );
    }
}
