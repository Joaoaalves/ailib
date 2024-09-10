import { CiTrash } from "react-icons/ci";
import { useEffect, useRef, useState } from "react";
import ChatRoot from "@/components/Chat/Chat";
import Layout from "@/components/Layout";
import ChatInput from "@/components/Chat/ChatInput";
import { ChatProvider } from "@/contexts/ChatContext";
import { useParams, useRouter } from "next/navigation";
import { IConversation } from "shared/types/conversation";
import { IoChatbubbleOutline } from "react-icons/io5";
import NavLink from "@/components/Sidepanel/NavLink";
import Nav from "@/components/Sidepanel/Nav";
import ChatList from "@/components/Chat/ChatList";

export default function Page() {
    const { documentId, conversationId } = useParams<{
        documentId: string;
        conversationId: string;
    }>();
    const inputRef = useRef(null);
    const [conversations, setConversations] = useState<IConversation[]>([]);

    const getConversations = async () => {
        const conversations = await window.backend.getConversations();
        setConversations(conversations);
    };

    useEffect(() => {
        if (inputRef.current) inputRef.current.scrollIntoView();
        getConversations();
    }, []);

    return (
        <ChatProvider
            documentId={documentId as string}
            conversationId={conversationId as string}
        >
            <Layout
                sidePanelLinks={
                    <ChatList
                        documentId={documentId}
                        conversations={conversations}
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
