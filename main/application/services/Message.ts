import { IMessage, IMessageRepository } from "@entities/Message";

export class MessageService {
    constructor(private messageRepository: IMessageRepository) {}

    async create(message: Partial<IMessage>): Promise<IMessage> {
        return this.messageRepository.create(message);
    }

    async delete(messageId: number): Promise<void> {
        return await this.messageRepository.delete(messageId);
    }
}
