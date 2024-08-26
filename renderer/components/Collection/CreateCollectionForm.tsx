"use client";
import { useState } from "react";
import Input from "../ui/Input";

export default function CreateCollectionForm() {
    const [collectionName, setCollectionName] = useState<string>("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const collectionId = window.backend.createCollection(collectionName);
    };

    return (
        <form onSubmit={handleSubmit}>
            <Input
                type="text"
                placeholder="Collection name..."
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
            />
        </form>
    );
}
