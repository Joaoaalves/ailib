import { useEffect, useRef, useState } from "react";
import ChatRoot from "@/components/Chat/Chat";
import Layout from "@/components/Layout";
import ChatInput from "@/components/Chat/ChatInput";
import { ChatProvider } from "@/contexts/ChatContext";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import ChatList from "@/components/Chat/ChatList";
import { useConversations } from "@/hooks/use-conversations";
import { useCollections } from "@/hooks/use-collections";
import { ICollection } from "shared/types/collection";

export default function Page() {
    // Prevent useParamsBug
    if (!useParams()) return;

    const { conversations } = useConversations();
    const inputRef = useRef(null);
    const router = useRouter();
    const { collectionId } = useParams<{ collectionId: string }>();

    const { collections } = useCollections();
    const [collection, setCollection] = useState<ICollection>();

    useEffect(() => {
        if (inputRef.current) inputRef.current.scrollIntoView();
    }, []);

    useEffect(() => {
        if (!collectionId) return router.push("/home");

        setCollection(collections?.filter((col) => col.id == collectionId)[0]);
    }, [collectionId]);

    return (
        <ChatProvider collectionId={collectionId}>
            <Layout
                sidePanelLinks={
                    <ChatList
                        collectionId={collectionId}
                        conversations={conversations}
                        router={router}
                    />
                }
            >
                <ChatRoot chatAgent={collection?.name}>
                    <ChatInput ref={inputRef} />
                </ChatRoot>
            </Layout>
        </ChatProvider>
    );
}
