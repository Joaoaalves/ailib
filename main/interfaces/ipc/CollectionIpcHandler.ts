import { ipcMain } from "electron";

import { CollectionRepository } from "@infra/repositories/CollectionRepository";

import { FormatResponseService } from "../services/FormatResponse";

// Create a new Collection
const collectionRepository = new CollectionRepository();

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
