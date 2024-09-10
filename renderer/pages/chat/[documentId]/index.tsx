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
    const { documentId } = useParams<{ documentId: string }>();

    useEffect(() => {
        if (inputRef.current) inputRef.current.scrollIntoView();
    }, []);

    useEffect(() => {
        if (!documentId) router.push("/home");
    }, [documentId]);

    return (
        <ChatProvider documentId={documentId}>
            <Layout
                sidePanelLinks={
                    <ChatList
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
