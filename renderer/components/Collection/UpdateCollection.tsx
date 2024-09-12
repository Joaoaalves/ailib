"use client";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/Dialog";
import { HiPencil } from "react-icons/hi";

import UpdateCollectionForm from "./UpdateCollectionForm";
import { ICollection } from "shared/types/collection";

export default function updateCollection({
    collection,
}: {
    collection: ICollection;
}) {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="grid place-items-center rounded text-white font-bold transition-all duration-300 bg-black hover:bg-primary size-12">
                    <HiPencil className="text-xl" />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-container border-none text-white">
                <DialogHeader>
                    <DialogTitle>Edit Collection</DialogTitle>
                </DialogHeader>
                <UpdateCollectionForm
                    setOpen={setOpen}
                    collection={collection}
                />
            </DialogContent>
        </Dialog>
    );
}
