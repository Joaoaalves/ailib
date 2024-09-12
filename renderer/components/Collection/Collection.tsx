import { IDocument } from "shared/types/document";
import { ICollection } from "shared/types/collection";
import Document from "@/components/Document/Document";
import { ScrollArea, ScrollBar } from "@/components/ui/ScrollArea";
import { IoChatbubbleOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/Carousel";

interface CollectionProps {
    collection: ICollection;
}

export default function Collection({ collection }: CollectionProps) {
    const router = useRouter();

    const handleNavigateChatCollection = () => {
        router.push(`/chat/${collection.id}`);
    };
    return (
        <div className="pt-8">
            <div
                className="flex items-center gap-x-4 group cursor-pointer mb-4"
                onClick={handleNavigateChatCollection}
            >
                <h2 className="text-3xl text-white group-hover:font-black transition-all duration-300">
                    {collection.name}
                </h2>

                <IoChatbubbleOutline className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-primary text-white text-2xl size-8 p-1 rounded-full" />

                <span className="ms-auto me-10 text-white">
                    {collection.Documents.length} Documents
                </span>
            </div>
            <Carousel className="w-[calc(100vw-360px)]">
                <CarouselContent>
                    {collection?.Documents?.length > 0 &&
                        collection.Documents.map((document: IDocument) => (
                            <CarouselItem className="basis-1/3">
                                <Document
                                    collectionId={collection.id}
                                    document={document}
                                    key={`document-${document.id}`}
                                />
                            </CarouselItem>
                        ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
            {/* 
            <ScrollArea className="w-[calc(100vw-360px)] h-full px-2">

                <ScrollBar orientation="horizontal" />
            </ScrollArea> */}
        </div>
    );
}
