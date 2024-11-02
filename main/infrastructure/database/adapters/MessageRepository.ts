import IMessage from "@domain/entities/Message";
import IMessageRepository from "@domain/repositories/MessageRepository";
import MessageModel from "@infra/database/models/MessageModel";
import { mapToEntity } from "@infra/utils/mapToEntity";

export class MessageRepositorySequelize implements IMessageRepository {
    async create(message: Partial<IMessage>): Promise<IMessage> {
        const msg = await MessageModel.create(message);
        if (msg) return mapToEntity<IMessage>(msg);
    }

    async findById(messageId: number): Promise<IMessage | null> {
        const msg = await MessageModel.findByPk(messageId);
        if (msg) return mapToEntity<IMessage>(msg);
    }

    async delete(messageId: number): Promise<void> {
        await MessageModel.destroy({
            where: {
                id: messageId,
            },
        });
    }
}
