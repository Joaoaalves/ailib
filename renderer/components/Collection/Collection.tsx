import { IDocument } from "shared/types/document";
import { ICollection } from "shared/types/collection";
import Document from "@/components/Document/Document";
import { ScrollArea, ScrollBar } from "@/components/ui/ScrollArea";
import { IoChatbubbleOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
interface CollectionProps {
    collection: ICollection;
}

export default function Collection({ collection }: CollectionProps) {
    const router = useRouter();

    const handleNavigateChatCollection = () => {
        router.push(`/chat/${collection.id}`);
    };
    return (
        <div className="pt-8 flex flex-col">
            <div
                className="flex items-center gap-x-4 group w-64 cursor-pointer"
                onClick={handleNavigateChatCollection}
            >
                <h2 className="text-3xl text-white group-hover:font-black transition-all duration-300">
                    {collection.name}
                </h2>

                <IoChatbubbleOutline className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-primary text-white text-2xl size-8 p-1 rounded-full" />
            </div>
            <ScrollArea className="w-[calc(100vw-400px)] h-full">
                <div className="flex items-center flex-nowrap gap-x-8 py-8 px-2">
                    {collection?.Documents?.length > 0 &&
                        collection.Documents.map((document: IDocument) => (
                            <Document
                                collectionId={collection.id}
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
