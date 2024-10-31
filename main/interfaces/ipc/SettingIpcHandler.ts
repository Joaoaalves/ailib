import { ipcMain } from "electron";

import { SettingRepository } from "@application/repositories/SettingRepository.";

import { FormatResponseService } from "@application/services/FormatResponse";

const settingService = new SettingRepository();

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
