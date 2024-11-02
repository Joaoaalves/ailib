import { ipcMain } from "electron";
import CreateCollectionUseCase from "@application/usecases/Collection/CreateCollectionUseCase";
import UpdateCollectionUseCase from "@application/usecases/Collection/UpdateCollectionUseCase";
import DeleteCollectionUseCase from "@application/usecases/Collection/DeleteCollectionUseCase";
import ListCollectionsUseCase from "@application/usecases/Collection/ListCollectionsUseCase";

import { CollectionRepositorySequelize } from "@infra/database/adapters/CollectionRepository";

import { FormatResponseService } from "../../infrastructure/services/FormatResponseService";

const collectionRepository = new CollectionRepositorySequelize();
const createCollectionUseCase = new CreateCollectionUseCase(
    collectionRepository,
);
const updateCollectionUseCase = new UpdateCollectionUseCase(
    collectionRepository,
);
const deleteCollectionUseCase = new DeleteCollectionUseCase(
    collectionRepository,
);
const listCollectionsUseCase = new ListCollectionsUseCase(collectionRepository);

ipcMain.handle("createCollection", async (event, collectionName: string) => {
    const collection = await createCollectionUseCase.execute({
        name: collectionName,
    });
    return FormatResponseService.formatToJson(collection);
});

// List all Collections
ipcMain.handle("getCollections", async (event) => {
    const collections = await listCollectionsUseCase.execute();
    return FormatResponseService.formatToJson(collections);
});

// Update Collection
ipcMain.handle("updateCollection", async (event, collectionId, data) => {
    await updateCollectionUseCase.execute(collectionId, data);
    return FormatResponseService.formatToJson(data);
});

// Delete Collection
ipcMain.handle("deleteCollection", async (event, collectionId) => {
    await deleteCollectionUseCase.execute(collectionId);
    return FormatResponseService.formatToJson({ collectionId });
});
