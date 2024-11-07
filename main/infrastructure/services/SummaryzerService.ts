import {
    EventEmitterService,
    IEventEmitterService,
} from "@infra/events/EventEmmiterService";
import { staticPrompts } from "@prompts/staticPrompts";

import IMessage from "@domain/entities/Message";

import { IOpenAIService } from "@infra/adapters/OpenAIAdapter";
import path from "path";
import { createWriteStream, existsSync, mkdirSync, WriteStream } from "fs";
import { EventsChannel } from "@infra/events/EventsChannel";
import { IpcMainEvent } from "electron";

export interface ISummaryzerService {
    setOutpuDir(documentId: number): void;
    setOutputPath(title: string): void;
    getOutputPath(): any;
    summaryze(pages: string[], model: string): Promise<void>;
}

export class SummaryzerService implements ISummaryzerService {
    private outputPath: any;
    private outputDir: any;
    private eventEmitterService: EventEmitterService;

    constructor(
        private openAIService: IOpenAIService,
        mainEvent: IpcMainEvent["sender"],
    ) {
        this.eventEmitterService = EventEmitterService.getInstance();
        this.eventEmitterService.setSender(mainEvent);
    }

    async summaryze(pages: string[], model: string): Promise<void> {
        this.eventEmitterService.emitProgress(
            EventsChannel.SUMMARY_PROGRESS,
            0,
        );

        const writeStream = this.getWriteStream();

        var lastSummary: string;

        for (let i = 0; i < pages.length; i += 4) {
            const startingPage = i;
            const endingPage = Math.min(pages.length, i + 4);

            lastSummary = await this.summarizePages(
                pages.slice(startingPage, endingPage),
                lastSummary,
                model,
            );

            this.eventEmitterService.emitProgress(
                EventsChannel.SUMMARY_PROGRESS,
                (endingPage * 100) / pages.length,
            );

            writeStream.write(lastSummary + "\n\n");
        }

        this.eventEmitterService.emit(EventsChannel.SUMMARY_COMPLETE);
    }

    setOutpuDir(documentId: number): void {
        this.outputDir = path.join(
            __dirname,
            `/storage/summaries/${documentId}`,
        );
    }

    setOutputPath(title: string): void {
        this.outputPath = path.join(this.outputDir, `${title}.txt`);
    }

    getOutputPath(): any {
        return this.outputPath;
    }

    private async summarizePages(
        pages: string[],
        lastSummary: string,
        model: string,
    ): Promise<string | null> {
        try {
            const userMessage = this.createMessage(
                pages.join("\n") +
                    "\n\nUltimo resumo, siga a partir dele: " +
                    lastSummary,
            );

            const content = await this.openAIService.chat(
                [staticPrompts.summaryCreationInstruction, userMessage],
                model,
            );
            return content;
        } catch (error) {
            throw error;
        }
    }

    private getWriteStream(): WriteStream {
        if (!existsSync(this.outputDir)) {
            mkdirSync(this.outputDir, { recursive: true });
        }

        return createWriteStream(this.outputPath, { flags: "a" });
    }

    private createMessage(
        query: string,
        role: "user" | "assistant" | "system" = "user",
    ): IMessage {
        return {
            role: role,
            content: query,
        };
    }
}
