import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

import { IoReaderOutline, IoChatboxOutline } from "react-icons/io5";

import { IDocument } from "shared/types/document";

import { Button } from "../ui/Button";
import { useRouter } from "next/navigation";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "../ui/ContextMenu";

interface DocumentProps {
    document: IDocument;
}

export default function Document({ document }: DocumentProps) {
    const router = useRouter();

    const handleRead = () : void => {
        router.push(`document/${document.id}`);
    };

    const handleChat = () : void => {
        router.push(`chat/${document.id}`);
    };

    const handleDelete = () : void =>  {
        window.backend.deleteDocument(document.id);
        router.refresh()
    };

    const handleSummary = () : void => {
        router.push(`summary/${document.id}`);
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <Card
                    id={`document-${document.id}`}
                    className="bg-container border-none text-white w-[400px] transition-all duration-300 shadow-primary"
                >
                    <CardHeader>
                        <img
                            className="mb-4 h-64 object-cover object-top rounded-xl bg-primary/10"
                            src={`${document.cover}`}
                        />
                        <CardTitle className="text-lg">
                            <span className="line-clamp-1">
                                {document.name}
                            </span>
                            <span className="text-neutral-400 text-xs">
                                Pages: {document.lastPageRead} /{" "}
                                {document.totalPages}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <Button
                                onClick={handleRead}
                                variant="outline"
                                className="flex items-center justify-center gap-x-2"
                            >
                                <IoReaderOutline className="text-lg" /> Read
                            </Button>
                            <Button
                                onClick={handleSummary}
                                variant="outline"
                                className="flex items-center justify-center gap-x-2"
                            >
                                <IoReaderOutline className="text-lg" /> Summary
                            </Button>
                            <Button
                                onClick={handleChat}
                                variant="outline"
                                className="flex items-center justify-center gap-x-2"
                            >
                                <IoChatboxOutline className="text-lg" /> Chat
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64 bg-container text-white shadow-primary border-primary/30">
                <ContextMenuItem inset onClick={handleDelete}>
                    Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
