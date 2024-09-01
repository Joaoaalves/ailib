import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";

const storageDir = path.join(__dirname, "storage");
const coverDir = path.join(storageDir, "covers");

export async function savePdfToStorage(
    pdfPath: string,
    bookName: string,
): Promise<string> {
    if (!fs.existsSync(storageDir)) {
        fs.mkdirSync(storageDir);
    }

    const filename = path.basename(pdfPath);
    if (!filename) {
        throw new Error("Invalid PDF path");
    }

    const newPath = path.join(storageDir, `${bookName}_${filename}`);

    await fs.promises.copyFile(pdfPath, newPath);

    return newPath;
}

export async function saveCoverOnStorage(
    coverBuffer: Buffer,
    documentName: string,
): Promise<string> {
    try {
        // Crie o diretório se ele não existir
        if (!fs.existsSync(coverDir)) {
            fs.mkdirSync(coverDir, { recursive: true });
        }
        const fileName = `${documentName.replace(/\s+/g, "_")}.png`;
        const filePath = path.join(coverDir, fileName);

        // Salve o Buffer como um arquivo no sistema de arquivos
        fs.writeFileSync(filePath, coverBuffer);

        return filePath;
    } catch (error) {
        console.error("Error saving document cover:", error);
    }
}

export async function parsePdfBuffer(pdfBuffer) {
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    return pdfDoc;
}
