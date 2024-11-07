import { EventEmitterService } from "./../events/EventEmmiterService";
import IMessage from "@domain/entities/Message";
import { IOpenAIService } from "@infra/adapters/OpenAIAdapter";
import { staticPrompts } from "@prompts/staticPrompts";
import { IRAGService } from "./RAGService";
import { IpcMainEvent } from "electron";
import { EventsChannel } from "@infra/events/EventsChannel";
import ITextChunk from "@domain/entities/TextChunk";
import ListTextChunksUseCase from "@application/usecases/TextChunk/ListTextChunksUseCase";
import { Op } from "sequelize";

export class ChatService {
    private eventEmitterService: EventEmitterService;

    constructor(
        private openAiService: IOpenAIService,
        sender: IpcMainEvent["sender"],
    ) {
        this.eventEmitterService = EventEmitterService.getInstance();
        this.eventEmitterService.setSender(sender);
    }

    async createChatTitle(message: IMessage): Promise<string> {
        return this.openAiService.chat([
            staticPrompts.titleCreationInstruction,
            message,
        ]);
    }

    async chatStream(
        messages: IMessage[],
        filter: object,
        ragService: IRAGService,
        listTextChunksUseCase: ListTextChunksUseCase,
    ) {
        this.eventEmitterService.emit(
            EventsChannel.CHAT_STREAM,
            "Searching for information over your library",
        );

        const userQuery = messages.at(-1).content;

        ragService.execute(userQuery, filter).then(async (result) => {
            this.eventEmitterService.emit(
                EventsChannel.CHAT_STREAM,
                "Sending best results to AI",
            );

            const chunkIds = result.map((result) => result.chunkId);

            const textChunks = await listTextChunksUseCase.execute({
                where: {
                    id: {
                        [Op.or]: chunkIds,
                    },
                },
                attributes: ["text"],
            });

            const lastMessage = messages.pop();

            lastMessage.content = this.mountPrompt(
                textChunks,
                lastMessage.content,
            );

            const systemMessage = staticPrompts.defaultChatInstruction;

            messages = [systemMessage, ...messages, lastMessage];

            const completionStream =
                await this.openAiService.chatStream(messages);

            for await (const chunk of completionStream) {
                this.eventEmitterService.emit(EventsChannel.CHAT_STREAM, chunk);
            }

            this.eventEmitterService.emit(EventsChannel.CHAT_STREAM_END);

            await this.eventEmitterService.emit(EventsChannel.CHAT_STREAM, "");
        });
    }

    private mountPrompt(textChunks: ITextChunk[], userMessage): string {
        return (
            "Context:\n---\n" +
            JSON.stringify(textChunks) +
            "\n---\nOriginal message from user:\n---\n" +
            userMessage
        );
    }
}
