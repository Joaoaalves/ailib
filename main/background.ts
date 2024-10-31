import "./interfaces/ipc/ChatIpcHandler";
import "./interfaces/ipc/CollectionIpcHandler";
import "./interfaces/ipc/ConversationIpcHandler";
import "./interfaces/ipc/DocumentIpcHandler";
import "./interfaces/ipc/DocumentProcessorIpcHandler";
import "./interfaces/ipc/RAGIpcHandler";
import "./interfaces/ipc/SettingIpcHandler";
import "./interfaces/ipc/SummaryIpcHandler";
import "./interfaces/ipc/WindowActionIpcHandler";

import { app, BrowserWindow, protocol, globalShortcut } from "electron";
import path from "path";

import syncDatabase from "./db/sync";
import createDefaultConfigsIfNotExists from "./helpers/defaultConfigs";

const isProd = process.env.NODE_ENV === "production";

app.on("ready", async () => {
    console.log("Databased synced!");
    await syncDatabase();

    await createDefaultConfigsIfNotExists();
    console.log("Configurations created!");

    if (BrowserWindow.getAllWindows().length == 0) {
        const mainWindow = new BrowserWindow({
            width: 1000,
            height: 600,
            titleBarStyle: "hidden",
            transparent: true,
            webPreferences: {
                webSecurity: false,
                preload: path.join(__dirname, "preload.js"),
            },
        });

        protocol.registerFileProtocol("atom", (request, callback) => {
            const url = request.url.substr(7);
            callback({ path: url });
        });

        globalShortcut.register("CommandOrControl+R", () => {
            console.log("CommandOrControl+R is pressed: Shortcut Disabled");
        });

        globalShortcut.register("F5", () => {
            console.log("F5 is pressed: Shortcut Disabled");
        });

        if (isProd) {
            mainWindow.loadURL("app://./home");
        } else {
            const port = process.argv[2];
            mainWindow.loadURL(`http://localhost:${port}/home`);
            mainWindow.maximize();
        }

        mainWindow.on("closed", () => {
            app.quit();
        });
    }
});

app.on("window-all-closed", () => {
    app.quit();
});
