import { StorageService } from "../../infrastructure/services/Storage";
import { ipcMain, IpcMainEvent } from "electron";
import { IDocument } from "@domain/entities/Document";

import { DocumentRepository } from "@application/repositories/Document";
import { SettingRepository } from "@application/repositories/Setting";
import { CollectionRepository } from "@application/repositories/Collection";

import { FormatResponseService } from "@application/services/FormatResponse";
import { QDrantService } from "@infra/services/QDrant";

import { QDrantAdapter } from "../../infrastructure/adapters/QDrant";

const documentRepository = new DocumentRepository();
const collectionRepository = new CollectionRepository();
const settingRepository = new SettingRepository();

const storageService = new StorageService();

const qdrantService = new QDrantService(new QDrantAdapter(settingRepository));
// Create Document
ipcMain.handle(
    "createDocument",
    async (
        event: IpcMainEvent,
        name: string,
        path: string,
        collectionId: number,
    ) => {
        const storagePdfPath = await storageService.savePdfToStorage(
            path,
            name,
        );

        const document = await documentRepository.create({
            name,
            path: storagePdfPath,
        });

        if (document) {
            await collectionRepository.addDocument(collectionId, document.id);

            return FormatResponseService.formatToJson(document);
        }

        return FormatResponseService.formatToJson({
            error: "Failed to create document.",
        });
    },
);

// Update Document
ipcMain.handle(
    "updateDocument",
    async (
        event: IpcMainEvent,
        documentId: number,
        updateFields: IDocument,
    ) => {
        await documentRepository.update(documentId, updateFields);
        return FormatResponseService.formatToJson(updateFields);
    },
);

// Get Document
ipcMain.handle("getDocument", async (event, documentId) => {
    const doc = await documentRepository.findById(documentId);

    return FormatResponseService.formatToJson(doc);
});

// Delete Document
ipcMain.handle("deleteDocument", async (event, documentId) => {
    await documentRepository.delete(documentId);
    await qdrantService.deletePointsForDocumentId(documentId);
});

ipcMain.handle(
    "saveCover",
    async (event: IpcMainEvent, documentId: number, cover: ArrayBuffer) => {
        const doc = await documentRepository.findById(documentId);

        if (doc) {
            const buffer = Buffer.from(cover);

            const coverPath = await storageService.saveCoverOnStorage(
                buffer,
                doc.name,
            );

            doc.cover = coverPath;

            await documentRepository.update(documentId, doc);

            return FormatResponseService.formatToJson(doc);
        }

        return {
            error: "Document not found!",
        };
    },
);

// Set Last Page Read
ipcMain.handle("setLastPageReadSave", async (event, documentId, page) => {
    const document = await documentRepository.findById(documentId);

    if (document) {
        document.lastPageRead = page;
        await documentRepository.update(documentId, document);
    }
});
