import { IConversation } from "shared/types/conversation";
import Nav from "../Sidepanel/Nav";
import NavLink from "../Sidepanel/NavLink";
import { IoChatbubbleOutline } from "react-icons/io5";
import { useConversations } from "@/hooks/use-conversations";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

interface ChatListProps {
    documentId: string;
    conversations: IConversation[];
    router: AppRouterInstance;
}

export default function ChatList({
    documentId,
    conversations,
    router,
}: ChatListProps) {
    if (!conversations?.length) return;

    return (
        <Nav>
            {conversations.map((conversation) => (
                <Conversation
                    conversation={conversation}
                    documentId={documentId}
                    key={`conv-${conversation.id}`}
                    router={router}
                />
            ))}
        </Nav>
    );
}

function Conversation({
    conversation,
    documentId,
    router,
}: {
    conversation: IConversation;
    documentId: string;
    router: AppRouterInstance;
}) {
    const { deleteConversation } = useConversations();

    return (
        <NavLink
            href={`/chat/${documentId}/${conversation.id}/`}
            label={conversation.title}
            router={router}
            Icon={<IoChatbubbleOutline />}
            Actions={[
                {
                    label: "Delete",
                    shortcut: "⌘D",
                    onClick: () => {
                        deleteConversation(conversation.id);
                        router.push(`/chat/${documentId}`);
                        router.refresh();
                    },
                },
            ]}
        />
    );
}
