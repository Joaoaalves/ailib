import IMessage from "@domain/entities/Message";
import IMessageRepository from "@domain/repositories/MessageRepository";
import MessageModel from "@infra/database/models/MessageModel";
import { EntityMapper } from "@infra/adapters/SequelizeReponseAdapter";

export class MessageRepositorySequelize implements IMessageRepository {
    async create(message: Partial<IMessage>): Promise<IMessage> {
        const msg = await MessageModel.create(message);
        if (msg) return EntityMapper.mapToEntity<IMessage>(msg);
    }

    async findById(messageId: number): Promise<IMessage | null> {
        const msg = await MessageModel.findByPk(messageId);
        if (msg) return EntityMapper.mapToEntity<IMessage>(msg);
    }

    async delete(messageId: number): Promise<void> {
        await MessageModel.destroy({
            where: {
                id: messageId,
            },
        });
    }
}
