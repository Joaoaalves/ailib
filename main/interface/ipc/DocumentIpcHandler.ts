import { StorageService } from "../../infrastructure/services/StorageService";
import { ipcMain, IpcMainEvent } from "electron";
import { Document } from "@domain/entities/Document";

import AddDocumentToCollectionUseCase from "@application/usecases/Collection/AddDocumentToCollectionUseCase";
import CreateDocumentUseCase from "@application/usecases/Document/CreateDocumentUseCase";
import GetDocumentUseCase from "@application/usecases/Document/GetDocumentUseCase";
import UpdateDocumentUseCase from "@application/usecases/Document/UpdateDocumentUseCase";
import DeleteDocumentUseCase from "@application/usecases/Document/DeleteDocumentUseCase";

import { DocumentRepositorySequelize } from "@infra/database/adapters/DocumentRepository";
import { CollectionRepositorySequelize } from "@infra/database/adapters/CollectionRepository";

import { FormatResponseService } from "../../infrastructure/services/FormatResponseService";

const documentRepository = new DocumentRepositorySequelize();
const collectionRepository = new CollectionRepositorySequelize();

const storageService = new StorageService();

const addDocumentToCollectionUseCase = new AddDocumentToCollectionUseCase(
    collectionRepository,
);

const createDocumentUseCase = new CreateDocumentUseCase(documentRepository);
const updateDocumentUseCase = new UpdateDocumentUseCase(documentRepository);
const getDocumentUseCase = new GetDocumentUseCase(documentRepository);
const deleteDocumentUseCase = new DeleteDocumentUseCase(documentRepository);

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
        const document = new Document({ name, path: storagePdfPath });

        const createdDocument = await createDocumentUseCase.execute(document);

        if (createdDocument) {
            await addDocumentToCollectionUseCase.execute(
                collectionId,
                createdDocument.id,
            );

            return FormatResponseService.formatToJson(createdDocument);
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
        updateFields: Partial<Document>,
    ) => {
        await updateDocumentUseCase.execute(documentId, updateFields);
        return FormatResponseService.formatToJson(updateFields);
    },
);

// Get Document
ipcMain.handle("getDocument", async (event, documentId) => {
    const doc = await getDocumentUseCase.execute(documentId);
    return FormatResponseService.formatToJson(doc);
});

// Delete Document
ipcMain.handle("deleteDocument", async (event, documentId) => {
    await deleteDocumentUseCase.execute(documentId);
});

// Set Last Page Read
ipcMain.handle("setLastPageReadSave", async (event, documentId, page) => {
    const document = await getDocumentUseCase.execute(documentId);

    if (document) {
        document.setLastPageRead(page);
        await updateDocumentUseCase.execute(documentId, document);
    }
});

// Save Cover
ipcMain.handle(
    "saveCover",
    async (event: IpcMainEvent, documentId: number, cover: ArrayBuffer) => {
        const doc = await getDocumentUseCase.execute(documentId);

        if (doc) {
            const buffer = Buffer.from(cover);
            const coverPath = await storageService.saveCoverOnStorage(
                buffer,
                doc.name,
            );

            doc.setCover(coverPath);
            await updateDocumentUseCase.execute(documentId, doc);

            return FormatResponseService.formatToJson(doc);
        }

        return {
            error: "Document not found!",
        };
    },
);
