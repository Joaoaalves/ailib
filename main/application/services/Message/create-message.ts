import { ICreateMessageRepository, IMessage } from "@entities/Message";

export class CreateMessageService {
    private createMessageRepository: ICreateMessageRepository;

    constructor(createMessageRepository: ICreateMessageRepository) {
        this.createMessageRepository = createMessageRepository;
    }

    async create(message: Partial<IMessage>): Promise<IMessage> {
        return this.createMessageRepository.create(message);
    }
}
