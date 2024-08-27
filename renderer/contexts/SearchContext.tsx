import React, { createContext, useState, useContext, ReactNode } from "react";
import { DocSearchResult } from "shared/types/document";

interface SearchProviderProps {
    children: ReactNode;
}

interface ISearchContext {
    search: (query: string) => Promise<void>;
    isSearching: boolean;
    searchResult: DocSearchResult;
}

const SearchContext = createContext<ISearchContext | undefined>(undefined);

const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
    const [isSearching, setIsSearching] = useState<boolean>();
    const [searchResult, setSeachResult] = useState<DocSearchResult>(undefined);

    const search = async (query: string) => {
        setIsSearching(true);

        const result = await window.backend.search(query);
        setSeachResult(result);
        setIsSearching(false);
    };

    return (
        <SearchContext.Provider
            value={{
                search,
                isSearching,
                searchResult,
            }}
        >
            {children}
        </SearchContext.Provider>
    );
};

const useSearch = (): ISearchContext => {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearch must be used within a Search Provider");
    }
    return context;
};

export { SearchProvider, useSearch };
