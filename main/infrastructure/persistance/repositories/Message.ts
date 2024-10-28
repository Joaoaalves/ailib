import { IMessage, IMessageRepository } from "@entities/Message";
import Message from "@models/Message";
import { mapToEntity } from "../utils/mapToEntity";

export class MessageRepository implements IMessageRepository {
    async create(message: Partial<IMessage>): Promise<IMessage> {
        const msg = await Message.create(message);
        return mapToEntity<IMessage>(msg);
    }

    async delete(messageId: number): Promise<void> {
        await Message.destroy({
            where: {
                id: messageId,
            },
        });
    }
}
