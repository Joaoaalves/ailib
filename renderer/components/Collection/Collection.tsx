import { IDocument } from "shared/types/document";
import { ICollection } from "shared/types/collection";
import Document from "@/components/Document/Document";
import { IoChatbubbleOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/Carousel";
import UpdateCollection from "./UpdateCollection";

interface CollectionProps {
    collection: ICollection;
}

export default function Collection({ collection }: CollectionProps) {
    const router = useRouter();

    const handleNavigateChatCollection = () => {
        router.push(`/chat/${collection.id}`);
    };
    return (
        <div className="pt-8 mb-28">
            <div className="flex items-center gap-x-4 group cursor-pointer mb-4">
                <h2 className="text-3xl text-white group-hover:font-black transition-all duration-300">
                    {collection.name}
                </h2>
                <div className="flex items-center gap-x-2 ms-auto mr-8">
                    <button className="grid place-items-center rounded text-white font-bold transition-all duration-300 bg-black hover:bg-primary size-12">
                        <IoChatbubbleOutline
                            onClick={handleNavigateChatCollection}
                            className="text-white text-xl size-8 p-1 rounded"
                        />
                    </button>

                    <UpdateCollection collection={collection} />
                </div>
            </div>
            <Carousel className="w-[calc(100vw-360px)]">
                <CarouselContent className="p-2">
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
        </div>
    );
}
