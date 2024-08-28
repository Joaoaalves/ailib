"use client";
import { ICollection } from "shared/types/collection";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/Select";

export default function CollectionPicker({
    collections,
    value,
    onChange,
}: {
    collections: ICollection[];
    value: number;
    onChange: (value: string) => void;
}) {
    return (
        <Select onValueChange={onChange} defaultValue={String(value)} required>
            <SelectTrigger className="w-full bg-black !text-white">
                <SelectValue placeholder="Select a collection..." />
            </SelectTrigger>
            <SelectContent className="bg-container text-white">
                <SelectGroup>
                    <SelectLabel>Collections</SelectLabel>
                    {collections.length > 0 &&
                        collections.map((col) => (
                            <SelectItem value={String(col.id)} key={col.id}>
                                {col.name}
                            </SelectItem>
                        ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
