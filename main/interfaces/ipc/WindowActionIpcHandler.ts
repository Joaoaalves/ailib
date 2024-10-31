import { BrowserWindow, ipcMain } from "electron";

ipcMain.handle("close", (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.close();
});

ipcMain.handle("minimize", (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    window?.minimize();
});
