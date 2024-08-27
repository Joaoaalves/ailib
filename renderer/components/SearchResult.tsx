"use client";
import { DocSearchResult } from "shared/types/document";
import PDFReader from "./PDF/PDFReader";

interface SearchResultProps {
    document: DocSearchResult;
}

export default function SearchResult({ document }: SearchResultProps) {
    return (
        <div className="grid grid-cols-2 grid-rows-2 items-center">
            <PDFReader
                document={document.document}
                path={document.document.path}
            />
        </div>
    );
}
