import { ipcMain, IpcMainEvent } from "electron";
import { createWriteStream, existsSync, mkdirSync, readFileSync } from "fs";
import path from "path";

import { SummaryRepositorySequelize } from "@infra/database/adapters/SummaryRepository";
import { DocumentRepositorySequelize } from "@infra/database/adapters/DocumentRepository";
import { SettingRepositorySequelize } from "@infra/database/adapters/SettingRepository";

import { OpenAIService } from "@infra/services/OpenAIService";
import { SummaryzerService } from "@infra/services/SummaryzerService";
import { FormatResponseService } from "../../infrastructure/services/FormatResponseService";

import { OpenAIAdapter } from "../../infrastructure/adapters/OpenAIAdapter";
import AddSummaryToDocumentUseCase from "@application/usecases/Document/AddSumaryToDocumentUseCase";

const summaryRepository = new SummaryRepositorySequelize();
const documentRepository = new DocumentRepositorySequelize();
const settingRepository = new SettingRepositorySequelize();

const openAIService = new OpenAIService(
    new OpenAIAdapter(settingRepository),
    settingRepository,
);

const summaryzerService = new SummaryzerService(openAIService);

const addSummaryToDocumentUseCase = new AddSummaryToDocumentUseCase(
    documentRepository,
);

ipcMain.handle(
    "summarizePages",
    async (
        event: IpcMainEvent,
        documentId: number,
        pages: string[],
        summaryTitle: string,
    ) => {
        const summaryModel = await settingRepository.findById("summaryModel");
        var lastSummary: string;

        const outputDir = path.join(
            __dirname,
            `/storage/summaries/${documentId}`,
        );
        const outputPath = path.join(outputDir, `${summaryTitle}.txt`);

        if (!existsSync(outputDir)) {
            mkdirSync(outputDir, { recursive: true });
        }

        var writeStream = createWriteStream(outputPath, { flags: "a" });

        for (let i = 0; i < pages.length; i += 4) {
            const startingPage = i;
            const endingPage = Math.min(pages.length, i + 4);

            lastSummary = await summaryzerService.summarizePages(
                pages.slice(startingPage, endingPage),
                lastSummary,
                summaryModel.value,
            );

            event.sender.send("summary-progress", {
                progress: (endingPage * 100) / pages.length,
            });

            writeStream.write(lastSummary + "\n\n");
        }

        writeStream.end();

        const summary = await summaryRepository.create({
            title: summaryTitle,
            path: outputPath,
            summaryType: "interval",
        });

        await addSummaryToDocumentUseCase.execute(documentId, summary.id);

        event.sender.send("summary-complete");
        return FormatResponseService.formatToJson(summary);
    },
);

ipcMain.handle("getSummaries", async (event) => {
    return FormatResponseService.formatToJson(
        await summaryRepository.findAll(),
    );
});

ipcMain.handle("getSummaryById", async (event, id) => {
    try {
        const summaryRepository = new SummaryRepositorySequelize();
        const summary = await summaryRepository.findById(id);

        if (summary) {
            const data = readFileSync(summary.path, "utf-8");
            summary.text = data;
            return FormatResponseService.formatToJson(summary);
        }

        return FormatResponseService.formatToJson({
            error: "Summary Not Found!",
        });
    } catch (error) {
        return FormatResponseService.formatToJson({
            error: "Error looking for Summary File.",
        });
    }
});
