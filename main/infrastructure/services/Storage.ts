import fs from "fs";
import path from "path";

export interface IStorageService {
    savePdfToStorage(filePath: string, documentName: string): Promise<string>;
    saveCoverOnStorage(
        coverBuffer: Buffer,
        documentName: string,
    ): Promise<string>;
}

export class StorageService implements IStorageService {
    private storageDir = path.join(__dirname, "storage");
    private coverDir = path.join(this.storageDir, "covers");

    private ensureDirectoriesExists() {
        if (!fs.existsSync(this.storageDir)) fs.mkdirSync(this.storageDir);

        if (!fs.existsSync(this.coverDir)) fs.mkdirSync(this.coverDir);
    }

    async savePdfToStorage(
        filePath: string,
        documentName: string,
    ): Promise<string> {
        this.ensureDirectoriesExists();

        const filename = path.basename(filePath);

        if (!filename) {
            throw new Error("Invalid PDF path");
        }

        const newPath = path.join(
            this.storageDir,
            `${documentName}_${filename}`,
        );

        await fs.promises.copyFile(filePath, newPath);

        return newPath;
    }

    async saveCoverOnStorage(
        coverBuffer: Buffer,
        documentName: string,
    ): Promise<string> {
        this.ensureDirectoriesExists();

        try {
            const fileName = `${documentName.replace(/\s+/g, "_")}.png`;
            const filePath = path.join(this.coverDir, fileName);

            // @ts-expect-error
            fs.writeFileSync(filePath, coverBuffer);

            return filePath;
        } catch (error) {
            console.error(`Error saving Cover on Storage: ${error}`);
        }
    }
}
