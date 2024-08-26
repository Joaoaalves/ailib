import { IDocument } from "shared/types/document";
import { ICollection } from "shared/types/collection";
import Document from "@/components/Document/Document";
import { ScrollArea, ScrollBar } from "@/components/ui/ScrollArea";

interface CollectionProps {
    collection: ICollection;
}

export default function Collection({ collection }: CollectionProps) {
    return (
        <div className="p-8">
            <h2 className="text-3xl font-black text-white">
                {collection.name}
            </h2>
            <ScrollArea className="w-[calc(100vw-400px)] h-full">
                <div className="flex items-center flex-nowrap gap-x-8 py-8 px-2">
                    {collection?.Documents?.length > 0 &&
                        collection.Documents.map((document: IDocument) => (
                            <Document
                                document={document}
                                key={`document-${document.id}`}
                            />
                        ))}
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
