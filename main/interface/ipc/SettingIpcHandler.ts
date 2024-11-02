import { ipcMain } from "electron";

import { SettingRepositorySequelize } from "@infra/database/adapters/SettingRepository";

import { FormatResponseService } from "../../infrastructure/services/FormatResponseService";

const settingService = new SettingRepositorySequelize();

ipcMain.handle("updateSetting", async (event, id, value) => {
    try {
        const setting = await settingService.update(id, value);
        return FormatResponseService.formatToJson(setting);
    } catch (error) {
        return {
            error: "Error updating Config",
        };
    }
});

ipcMain.handle("getSettings", async () => {
    try {
        const settings = await settingService.findAll();

        return FormatResponseService.formatToJson(settings);
    } catch (error) {
        return {
            error: "Error geting Configs",
        };
    }
});
