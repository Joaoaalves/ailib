import { ipcMain, IpcMainEvent } from "electron";
import { readFileSync } from "fs";

import AddSummaryToDocumentUseCase from "@application/usecases/Document/AddSumaryToDocumentUseCase";
import CreateSummaryUseCase from "@application/usecases/Summary/CreateSummaryUseCase";
import ListSummarysUseCase from "@application/usecases/Summary/ListSummarysUseCase";

import { SummaryRepositorySequelize } from "@infra/database/adapters/SummaryRepository";
import { DocumentRepositorySequelize } from "@infra/database/adapters/DocumentRepository";
import { SettingRepositorySequelize } from "@infra/database/adapters/SettingRepository";

import { OpenAIService } from "@infra/services/OpenAIService";
import { SummaryzerService } from "@infra/services/SummaryzerService";
import { FormatResponseService } from "../../infrastructure/services/FormatResponseService";

import { OpenAIAdapter } from "../../infrastructure/adapters/OpenAIAdapter";
import GetSummaryUseCase from "@application/usecases/Summary/GetSummaryUseCase";
import { SettingService } from "@infra/services/SettingService";

const summaryRepository = new SummaryRepositorySequelize();
const documentRepository = new DocumentRepositorySequelize();
const settingRepository = new SettingRepositorySequelize();

const addSummaryToDocumentUseCase = new AddSummaryToDocumentUseCase(
    documentRepository,
);
const createSummaryUseCase = new CreateSummaryUseCase(summaryRepository);
const listSummarysUseCase = new ListSummarysUseCase(summaryRepository);
const getSummaryUseCase = new GetSummaryUseCase(summaryRepository);

const settingService = new SettingService(settingRepository);

ipcMain.handle(
    "summarizePages",
    async (
        event: IpcMainEvent,
        documentId: number,
        pages: string[],
        summaryTitle: string,
    ) => {
        const openAiApiKey = await settingService.getOpenAIApiKey();
        const summaryModel = await settingService.getConversationModel();

        const openAIAdapter = new OpenAIAdapter(openAiApiKey);
        openAIAdapter.setConversationModel(summaryModel);

        const openAIService = new OpenAIService(
            new OpenAIAdapter(openAiApiKey),
            settingService,
        );

        const summaryzerService = new SummaryzerService(
            openAIService,
            event.sender,
        );

        summaryzerService.setOutpuDir(documentId);
        summaryzerService.setOutputPath(summaryTitle);

        await summaryzerService.summaryze(pages);

        const summary = await createSummaryUseCase.execute({
            title: summaryTitle,
            path: summaryzerService.getOutputPath(),
        });

        await addSummaryToDocumentUseCase.execute(documentId, summary.id);

        return FormatResponseService.formatToJson(summary);
    },
);

ipcMain.handle("getSummaries", async (event) => {
    return FormatResponseService.formatToJson(
        await listSummarysUseCase.execute(),
    );
});

ipcMain.handle("getSummaryById", async (event, id) => {
    try {
        const summary = await getSummaryUseCase.execute(id);

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
