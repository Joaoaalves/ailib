import fs from "fs";
import path from "path";
import { PDFDocument } from "pdf-lib";

import pdfPoppler from "pdf-poppler";

export async function savePdfToStorage(
    pdfPath: string,
    bookName: string,
): Promise<string> {
    const storageDir = path.join(__dirname, "storage");

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

export async function extractCover(
    pdfPath: string,
    bookName: string,
): Promise<string | null> {
    try {
        const outputDir = path.dirname("./app/storage/covers/");
        const outputImagePath = path.resolve(outputDir, `${bookName}.png`);

        const options = {
            format: "png",
            out_dir: outputDir,
            out_prefix: bookName,
            page: 1,
        };

        await pdfPoppler.convert(pdfPath, options);
        return outputImagePath;
    } catch (error) {
        console.error("Erro ao converter PDF para imagem:", error);
        throw error;
    }
}

export async function parsePdfBuffer(pdfBuffer) {
    const pdfDoc = await PDFDocument.load(pdfBuffer);

    return pdfDoc;
}
