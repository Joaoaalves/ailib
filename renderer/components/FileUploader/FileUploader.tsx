"use client";

import { useDropzone, Accept } from "react-dropzone";
import { useState, useCallback, useEffect, useRef } from "react";
import { ICollection } from "shared/types/collection";
import CollectionPicker from "./CollectionPicker";
import Input from "../ui/Input";
import { usePDFJS } from "@/hooks/usePDFJS";

// Type of Document model on database
import { IDocument } from "shared/types/document";
import { PDFDocumentProxy } from "pdfjs-dist";

const FileUploader = () => {
    const collectionRef = useRef(null);
    const [collections, setCollections] = useState<ICollection[] | null>(null);
    const pdfPathRef = useRef<string>("");
    const bookNameRef = useRef<string>("");

    const createDocument = async (): Promise<IDocument> => {
        const document = await window.backend.createDocument(
            bookNameRef.current,
            pdfPathRef.current,
            collectionRef.current,
        );
        return document;
    };

    const getPageText = async (pdf: PDFDocumentProxy, pageNo: number) => {
        const page = await pdf.getPage(pageNo);
        const tokenizedText = await page.getTextContent();
        const pageText = tokenizedText.items.map((token) => token.str).join("");
        return pageText;
    };

    const saveCover = async (pdf: PDFDocumentProxy, doc: IDocument) => {
        const page = await pdf.getPage(1);

        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = window.document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport,
        };

        await page.render(renderContext).promise;

        // Converte o canvas para Blob
        canvas.toBlob(async (blob) => {
            if (blob) {
                const coverBuffer = await blob.arrayBuffer();
                try {
                    window.backend.saveCover(doc.id, coverBuffer);
                } catch (error) {
                    console.error("Erro ao salvar a capa do documento:", error);
                }
            }
        }, "image/png");
    };

    const saveDocumentTotalPages = async (
        documentId: number,
        totalPages: number,
    ) => {
        window.backend.updateDocument(documentId, { totalPages });
    };

    const processPDF = usePDFJS(async (pdfjs) => {
        const document = await createDocument();

        const pdf = await pdfjs.getDocument({ url: pdfPathRef.current })
            .promise;

        await saveCover(pdf, document);

        const maxPages = pdf.numPages;
        saveDocumentTotalPages(document.id, maxPages);

        const pageTextPromises = [];
        for (let pageNo = 1; pageNo <= maxPages; pageNo += 1) {
            pageTextPromises.push(getPageText(pdf, pageNo));
        }
        const pages: string[] = await Promise.all(pageTextPromises);

        window.backend.processPdf(pages, document.id, collectionRef.current);
    });

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        const path = file.path;

        pdfPathRef.current = path;

        const name = file.name.replace(".pdf", "");

        bookNameRef.current = name;
    }, []);

    const acceptConfig: Accept = {
        "application/pdf": [".pdf"],
    };

    const getCollections = async () => {
        const cols = await window.backend.getCollections();
        setCollections(cols);
    };

    useEffect(() => {
        getCollections();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!pdfPathRef.current) {
            console.error("No PDF path available");
            return;
        }

        await processPDF();
    };

    const { getRootProps, getInputProps } = useDropzone({
        onDrop,
        accept: acceptConfig,
    });

    return (
        <form className="space-y-8" onSubmit={handleSubmit}>
            <div
                {...getRootProps({ className: "dropzone" })}
                className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-400 transition-all duration-300 rounded-lg p-6 cursor-pointer hover:bg-neutral-500"
            >
                <input {...getInputProps()} />
                <p className="text-white text-lg">
                    Arraste e solte um arquivo PDF aqui, ou clique para
                    selecionar o arquivo
                </p>
            </div>
            <Input
                type="text"
                placeholder="Set your filename..."
                value={bookNameRef.current}
                onChange={(e) => (bookNameRef.current = e.target.value)}
            />
            {collections && (
                <CollectionPicker
                    collections={collections}
                    value={collectionRef.current}
                    onChange={(value) => (collectionRef.current = value)}
                />
            )}

            <Input type="submit" value={"Enviar"} />
        </form>
    );
};

export default FileUploader;
