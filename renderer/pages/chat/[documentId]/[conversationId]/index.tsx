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

export default function Page(){
    const [conversations, setConversations] = useState<IConversation[]>([])

    const inputRef = useRef(null)
    const { documentId, conversationId } = useParams();

    const getConversations = async () => {
        const conversations = await window.backend.getConversations();
        setConversations(conversations);
        
    }

    useEffect(() => {
        if(inputRef.current)
            inputRef.current.scrollIntoView()
        getConversations()
    }, [])

    return (
        <ChatProvider documentId={documentId as string} conversationId={conversationId as string}>
            <Layout sidePanelLinks={
                conversations ? <Nav>
                    {conversations.map(conversation => (
                        <Conversation conversation={conversation} documentId={documentId as string} key={`conv-${conversation.id}`} />
                    ))}
                </Nav>
                : <></>
            }>
                <ChatRoot>
                    <ChatInput ref={inputRef}/>
                </ChatRoot>
            </Layout>
        </ChatProvider>
    )
}

function Conversation({conversation, documentId}:{conversation:IConversation, documentId:string}){
    const router = useRouter()
    return <NavLink href={`/chat/${documentId}/${conversation.id}/`} label={conversation.title} router={router} Icon={<IoChatbubbleOutline />} Actions={[
        {
            label: 'Delete',
            shortcut: '⌘R',
            onClick: () => {
                window.openai.deleteConversation(conversation.id)
                router.push(`/chat/${documentId}`)
            }
        }
    ]} />
}