import { IDeleteMessageRepository } from "@entities/Message";
import Message from "@models/Message";

export class DeleteMessageRepository implements IDeleteMessageRepository {
    async delete(messageId: number): Promise<void> {
        await Message.destroy({
            where: {
                id: messageId,
            },
        });
    }
}
