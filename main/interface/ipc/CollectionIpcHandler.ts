import { ipcMain } from "electron";

import { CollectionRepositorySequelize } from "@infra/database/adapters/CollectionRepository";

import { FormatResponseService } from "../../infrastructure/services/FormatResponseService";

// Create a new Collection
const collectionRepository = new CollectionRepositorySequelize();

ipcMain.handle("createCollection", async (event, collectionName: string) => {
    const collection = await collectionRepository.create({
        name: collectionName,
    });
    return FormatResponseService.formatToJson(collection);
});

// List all Collections
ipcMain.handle("getCollections", async (event) => {
    const collections = await collectionRepository.findAll();
    return FormatResponseService.formatToJson(collections);
});

// Update Collection
ipcMain.handle("updateCollection", async (event, collectionId, data) => {
    await collectionRepository.update(collectionId, data);
    return FormatResponseService.formatToJson(data);
});

// Delete Collection
ipcMain.handle("deleteCollection", async (event, collectionId) => {
    await collectionRepository.delete(collectionId);
    return FormatResponseService.formatToJson({ collectionId });
});
