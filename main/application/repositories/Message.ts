import { IMessage, IMessageRepository } from "@domain/entities/Message";
import Message from "@infra/database/models/MessageModel";
import { mapToEntity } from "@infra/utils/mapToEntity";

export class MessageRepository implements IMessageRepository {
    async create(message: Partial<IMessage>): Promise<IMessage> {
        const msg = await Message.create(message);
        if (msg) return mapToEntity<IMessage>(msg);
    }

    async findById(messageId: number): Promise<IMessage | null> {
        const msg = await Message.findByPk(messageId);
        if (msg) return mapToEntity<IMessage>(msg);
    }

    async delete(messageId: number): Promise<void> {
        await Message.destroy({
            where: {
                id: messageId,
            },
        });
    }
}
