import { IDeleteMessageRepository } from "@entities/Message";

export class DeleteMessageService {
    private deleteMessageRepository: IDeleteMessageRepository;
    constructor(deleteMessageRepository: IDeleteMessageRepository) {
        this.deleteMessageRepository = deleteMessageRepository;
    }

    async delete(messageId: number): Promise<void> {
        return await this.deleteMessageRepository.delete(messageId);
    }
}
