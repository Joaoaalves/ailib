import { ScrollArea } from "@/components/ui/ScrollArea";
import { useSearch } from "@/contexts/SearchContext";
import { ReactNode } from "react";
import PDFReader from "./PDF/PDFReader";

interface PageContentProps {
    children: ReactNode;
}

export default function PageContent({ children }: PageContentProps) {
    const { isSearching, searchResult } = useSearch();

    return (
        <ScrollArea>
            {isSearching ? (
                <Searching />
            ) : searchResult ? (
                <PDFReader
                    document={searchResult.document}
                    path={searchResult.document.path}
                    page={searchResult.page}
                />
            ) : (
                children
            )}
        </ScrollArea>
    );
}

function Searching() {
    return (
        <div className="w-full h-[calc(100vh-150px)] flex flex-col items-center justify-center">
            <div className="flex space-x-2 justify-center items-center h-screen dark:invert">
                <div className="h-3 w-3 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="h-3 w-3 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="h-3 w-3 bg-black rounded-full animate-bounce"></div>
            </div>
        </div>
    );
}
