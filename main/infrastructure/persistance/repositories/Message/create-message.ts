import { ICreateMessageRepository, IMessage } from "@entities/Message";
import Message from "@models/Message";
import { mapToEntity } from "../../utils/mapToEntity";

export class CreateMessageRepository implements ICreateMessageRepository {
    async create(message: Partial<IMessage>): Promise<IMessage> {
        const msg = await Message.create(message);
        return mapToEntity<IMessage>(msg);
    }
}
