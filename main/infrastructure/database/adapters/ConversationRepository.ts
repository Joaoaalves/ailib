import IConversation from "@domain/entities/Conversation";
import IConversationRepository from "@domain/repositories/ConversationRepository";
import ConversationModel from "@infra/database/models/ConversationModel";
import MessageModel from "@infra/database/models/MessageModel";
import { mapToEntity } from "@infra/adapters/SequelizeReponseAdapter";

export class ConversationRepositorySequelize
    implements IConversationRepository
{
    async create(conversation: Partial<IConversation>): Promise<IConversation> {
        const cnvs = await ConversationModel.create(conversation);
        return mapToEntity<IConversation>(cnvs);
    }

    async findAll(): Promise<IConversation[]> {
        const conversations = await ConversationModel.findAll();
        return conversations.map((conversation) =>
            mapToEntity<IConversation>(conversation),
        );
    }

    async findById(conversationId: number): Promise<IConversation> {
        const conversation = await ConversationModel.findByPk(conversationId);
        return mapToEntity<IConversation>(conversation);
    }

    async delete(conversationId: number): Promise<void> {
        const conversation = await ConversationModel.findByPk(conversationId, {
            include: MessageModel,
        });

        // @ts-expect-error
        const messages = conversation.dataValues.Messages;

        if (messages?.length) {
            await MessageModel.destroy({
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
        const conversation = await ConversationModel.findByPk(conversationId);
        const message = await MessageModel.findByPk(messageId);

        await conversation.addMessage(message);
    }

    async getMessages(conversationId: number): Promise<IConversation> {
        const conversation = await ConversationModel.findByPk(conversationId, {
            include: MessageModel,
            order: [["id", "ASC"]],
        });

        return mapToEntity<IConversation>(conversation);
    }
}
