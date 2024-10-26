import { IDeleteConversationRepository } from "@entities/Conversation";
import Conversation from "@models/Conversation";
import Message from "@models/Message";

export class DeleteConversationRepository
    implements IDeleteConversationRepository
{
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
}
