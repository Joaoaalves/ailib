import { IDocument } from "shared/types/document";

export interface HProcessPDF {
    event: Electron.IpcMainInvokeEvent;
    pages: string[];
    document: IDocument;
    collectionId: number;
    offset: number;
}
