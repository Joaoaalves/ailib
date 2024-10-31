import {
    IConversation,
    IConversationRepository,
} from "@domain/entities/Conversation";
import Conversation from "@domain/models/Conversation";
import Message from "@domain/models/Message";
import { mapToEntity } from "@infra/utils/mapToEntity";

export class ConversationRepository implements IConversationRepository {
    async create(conversation: Partial<IConversation>): Promise<IConversation> {
        const cnvs = await Conversation.create(conversation);
        return mapToEntity<IConversation>(cnvs);
    }

    async findAll(): Promise<IConversation[]> {
        const conversations = await Conversation.findAll();
        return conversations.map((conversation) =>
            mapToEntity<IConversation>(conversation),
        );
    }

    async findById(conversationId: number): Promise<IConversation> {
        const conversation = await Conversation.findByPk(conversationId);
        return mapToEntity<IConversation>(conversation);
    }

    async delete(conversationId: number): Promise<void> {
        const conversation = await Conversation.findByPk(conversationId, {
            include: Message,
        });

        // @ts-expect-error
        const messages = conversation.dataValues.Messages;

        if (messages?.length) {
            await Message.destroy({
                where: {
                    id: {
                        includes: messages.map((message) => message.id),
                    },
                },
            });
        }

        await conversation.destroy();
    }

    async addMessage(conversationId: number, messageId: number): Promise<void> {
        const conversation = await Conversation.findByPk(conversationId);
        const message = await Message.findByPk(messageId);

        await conversation.addMessage(message);
    }

    async getMessages(conversationId: number): Promise<IConversation> {
        const conversation = await Conversation.findByPk(conversationId, {
            include: Message,
            order: [["id", "ASC"]],
        });

        return mapToEntity<IConversation>(conversation);
    }
}
