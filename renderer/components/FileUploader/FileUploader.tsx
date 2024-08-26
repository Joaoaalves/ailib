"use client";

import { useDropzone, Accept } from "react-dropzone";
import { useState, useCallback, useEffect } from "react";
import { ICollection } from "shared/types/collection";
import CollectionPicker from "./CollectionPicker";
import Input from "../ui/Input";
import { usePDFJS } from "@/hooks/usePDFJS";

const FileUploader = () => {
    const [collection, setCollection] = useState<number | null>();
    const [collections, setCollections] = useState<ICollection[] | null>();
    const [pdfPath, setPdfPath] = useState<string>("");
    const [bookName, setBookName] = useState<string>("");

    const processPDF = usePDFJS(async (pdfjs) => {
        const getPageText = async (pdf, pageNo: number) => {
            const page = await pdf.getPage(pageNo);
            const tokenizedText = await page.getTextContent();
            const pageText = tokenizedText.items
                .map((token) => token.str)
                .join("");
            return pageText;
        };

        const pdf = await pdfjs.getDocument(pdfPath).promise;
        const maxPages = pdf.numPages;
        const pageTextPromises = [];
        for (let pageNo = 1; pageNo <= maxPages; pageNo += 1) {
            pageTextPromises.push(getPageText(pdf, pageNo));
        }
        const pages = await Promise.all(pageTextPromises);

        window.backend.processPdf(pages, pdfPath, bookName, collection);
    });

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        setPdfPath(file.path);
        setBookName(file.name.replace(".pdf", ""));
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
                value={bookName}
                onChange={(e) => setBookName(e.target.value)}
            />
            {collections && (
                <CollectionPicker
                    collections={collections}
                    collection={collection}
                    setCollection={setCollection}
                />
            )}

            <Input type="submit" value={"Enviar"} />
        </form>
    );
};

export default FileUploader;
