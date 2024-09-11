"use client";
import { useState } from "react";
import Input from "../ui/Input";
import { useCollections } from "@/hooks/use-collections";
import { Button } from "../ui/Button";

export default function CreateCollectionForm({ setOpen }) {
    const { createCollection } = useCollections();
    const [collectionName, setCollectionName] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        createCollection(collectionName);
        setOpen(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <Input
                type="text"
                placeholder="Collection name..."
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                required
            />
            <Button className="w-full">Create Collection</Button>
        </form>
    );
}
