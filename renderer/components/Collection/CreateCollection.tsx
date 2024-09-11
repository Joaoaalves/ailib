"use client";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/Dialog";
import { HiPlus } from "react-icons/hi";

import CreateCollectionForm from "./CreateCollectionForm";

export default function CreateCollection() {
    const [open, setOpen] = useState<boolean>(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="bg-container grid grid-cols-[8px_1fr] gap-x-4 items-center my-4 rounded-xl text-white font-bold transition-all duration-300 hover:bg-black p-4 w-80">
                    <HiPlus className="text-xl" />
                    New Collection
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-container border-none text-white">
                <DialogHeader>
                    <DialogTitle>Upload New Document</DialogTitle>
                </DialogHeader>
                <CreateCollectionForm setOpen={setOpen} />
            </DialogContent>
        </Dialog>
    );
}
