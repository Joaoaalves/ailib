export interface HProcessPDF{
    event : Electron.IpcMainInvokeEvent;
    pages: string[];
    pdfPath: string; 
    bookName: string; 
    collectionId : number;
}