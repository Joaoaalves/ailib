import { ScrollArea } from "@/components/ui/ScrollArea";
import { useSearch } from "@/contexts/SearchContext";
import { ReactNode } from "react";
import SearchResult from "./SearchResult";
import PDFViewer from "./PDF/PDFReader";

interface PageContentProps {
    children: ReactNode;
}

export default function PageContent({ children }: PageContentProps) {
    const { isSearching, searchResult } = useSearch();
    // Have to implement Search Result

    return <ScrollArea>{children}</ScrollArea>;
}

function Searching() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <span className="color-white">Searching...</span>
        </div>
    );
}
