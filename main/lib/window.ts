import { BrowserWindow } from "electron";

export function closeWindow(window: BrowserWindow) {
    window.close();
}

export function minimizeWindow(window: BrowserWindow) {
    window.minimize();
}
