import { Badge } from "../ui/Badge";
import { ReactNode, useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/Dialog";
import FileUploader from "../FileUploader/FileUploader";
import Search from "./Search";
import Welcome from "./Welcome";
import ProgressBar from "../FileUploader/ProgressBar";

interface TopBarProps {
    children?: ReactNode;
}

import { useUploadDocument } from "@/contexts/DocumentUploadProvider";

export default function TopBar({ children }: TopBarProps) {
    const {isEmbedding, progressPercentage, embeddingCost} = useUploadDocument();
    const [open, setOpen] = useState<boolean>(false);

    useEffect(() => {
        if(isEmbedding == open && !isEmbedding)
            return
        
        if(progressPercentage == 100)
            return setOpen(false)

        setOpen(!isEmbedding)
    }, [isEmbedding])

    return (
        <div className="col-start-2 bg-container rounded-b-3xl grid grid-rows-[80px_1fr] grid-cols-1 shadow-custom-outset">
            {children}
            <div className="border-b-2 border-neutral-700 grid grid-rows-1 grid-cols-3">
                <Welcome />
                <Search />
            </div>
            <div className="grid grid-rows-1 grid-cols-3 w-full px-4 relative">
                <div className="flex items-center justify-start gap-x-4">
                    <Badge className="p-2 cursor-pointer">Collections</Badge>
                    <Badge
                        className="p-2 text-white cursor-pointer"
                        variant="outline"
                    >
                        Summarizer
                    </Badge>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <button disabled={isEmbedding} className="my-4 rounded-xl text-white font-bold transition-all duration-300 bg-black">
                            {isEmbedding ? `Progress: ${progressPercentage.toFixed(1)}% (Cost: $${embeddingCost.toFixed(3)})` : "Upload New Document"}
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-container border-none">
                        <DialogHeader>
                            <DialogTitle className="text-white text-center">
                                Upload New Document
                            </DialogTitle>
                        </DialogHeader>
                        <FileUploader />
                    </DialogContent>
                </Dialog>

                <ProgressBar />
            </div>
        </div>
    );
}
