import Key from "@/components/ui/Key";
import { useEffect, useRef, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { useSearch } from "@/contexts/SearchContext";

export default function Search() {
    const inputRef = useRef<HTMLInputElement>();
    const [isFocused, setIsFocused] = useState<boolean>(false);
    const { search, searchResult, isSearching } = useSearch();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        await search(inputRef.current.value);
    };

    useEffect(() => {
        if (!isSearching && searchResult) console.log(searchResult);
    }, [isSearching]);

    return (
        <form
            onSubmit={handleSearch}
            className={`bg-black my-4 rounded-xl grid grid-cols-[48px_1fr_96px] grid-rows-1 transition-all duration-500 place-items-center ${isFocused ? "shadow-md shadow-primary/50" : ""}`}
        >
            <CiSearch className="text-2xl text-white" />
            <input
                type="text"
                className="w-full bg-transparent text-white outline-none"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                ref={inputRef}
                placeholder="Search"
            />
            <div className="flex gap-x-2 text-white">
                <Key>⌘</Key>
                <Key>K</Key>
            </div>
        </form>
    );
}
