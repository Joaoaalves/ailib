import { useEffect, useRef } from "react";
import ChatRoot from "@/components/Chat/Chat";
import Layout from "@/components/Layout";
import ChatInput from "@/components/Chat/ChatInput";
import { ChatProvider } from "@/contexts/ChatContext";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import ChatList from "@/components/Chat/ChatList";
import { useConversations } from "@/hooks/use-conversations";

export default function Page() {
    // Prevent useParamsBug
    if (!useParams()) return;

    const { conversations } = useConversations();
    const inputRef = useRef(null);
    const router = useRouter();
    const { collectionId } = useParams<{ collectionId: string }>();

    useEffect(() => {
        if (inputRef.current) inputRef.current.scrollIntoView();
    }, []);

    useEffect(() => {
        if (!collectionId) router.push("/home");
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
                <ChatRoot>
                    <ChatInput ref={inputRef} />
                </ChatRoot>
            </Layout>
        </ChatProvider>
    );
}
