"use client";
import { useEffect, useRef } from "react";
import ChatRoot from "@/components/Chat/Chat";
import Layout from "@/components/Layout";
import ChatInput from "@/components/Chat/ChatInput";
import { ChatProvider } from "@/contexts/ChatContext";
import { useParams } from "next/navigation";
import ChatList from "@/components/Chat/ChatList";
import { useRouter } from "next/navigation";
import { useConversations } from "@/hooks/use-conversations";

export default function Page() {
    // Prevent useParamsBug
    if (!useParams()) return;

    const { collectionId, documentId, conversationId } = useParams<{
        collectionId: string;
        documentId: string;
        conversationId: string;
    }>();
    const inputRef = useRef(null);

    const { conversations } = useConversations();
    const router = useRouter();

    useEffect(() => {
        if (!documentId || !conversationId) router.push("/home");
    }, [documentId]);

    useEffect(() => {
        if (inputRef.current) inputRef.current.scrollIntoView();
    }, []);

    return (
        <ChatProvider
            collectionId={collectionId}
            documentId={documentId}
            conversationId={conversationId}
        >
            <Layout
                sidePanelLinks={
                    <ChatList
                        collectionId={collectionId}
                        documentId={documentId}
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
