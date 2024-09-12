"use client";
import { useState } from "react";
import Input from "../ui/Input";
import { useCollections } from "@/hooks/use-collections";
import { Button } from "../ui/Button";
import { Label } from "../ui/Label";

export default function updateCollectionForm({ setOpen, collection }) {
    const { updateCollection } = useCollections();
    const [collectionName, setCollectionName] = useState<string>(
        collection.name,
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        collection.name = collectionName;
        updateCollection(collection);
        setOpen(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 mt-8">
            <div className="space-y-1">
                <Label className="text-neutral-300">Name</Label>
                <Input
                    type="text"
                    placeholder="Collection name..."
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    required
                />
            </div>
            <Button className="w-full">Save</Button>
        </form>
    );
}
