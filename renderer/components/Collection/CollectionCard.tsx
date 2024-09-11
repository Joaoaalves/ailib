import { ICollection } from "shared/types/collection";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

import { Button } from "../ui/Button";
import { useRouter } from "next/navigation";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "../ui/ContextMenu";
import { useCollections } from "@/hooks/use-collections";

export default function CollectionCard({
    collection,
}: {
    collection: ICollection;
}) {
    const { deleteCollection } = useCollections();
    const router = useRouter();

    return (
        <ContextMenu>
            <ContextMenuTrigger>
                <Card
                    id={`collection-${collection.id}`}
                    className="bg-container border-none text-white w-[400px] transition-all duration-300 shadow-primary"
                >
                    <CardHeader>
                        <CardTitle className="text-lg">
                            <span className="line-clamp-1">
                                {collection.name}
                            </span>
                            <span className="text-neutral-400 text-xs">
                                Documents: {collection?.Documents?.length}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between"></div>
                    </CardContent>
                </Card>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64 bg-container text-white shadow-primary border-primary/30">
                <ContextMenuItem
                    inset
                    onClick={() => deleteCollection(collection.id)}
                >
                    Delete
                </ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}
