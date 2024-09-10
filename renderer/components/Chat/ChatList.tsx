import { IConversation } from "shared/types/conversation";
import Nav from "../Sidepanel/Nav";
import { useRouter } from "next/navigation";
import NavLink from "../Sidepanel/NavLink";
import { IoChatbubbleOutline } from "react-icons/io5";

interface ChatListProps {
    documentId: string;
    conversations: IConversation[];
}

export default function ChatList({ documentId, conversations }: ChatListProps) {
    if (!conversations?.length) return;

    return (
        <Nav>
            {conversations.map((conversation) => (
                <Conversation
                    conversation={conversation}
                    documentId={documentId}
                    key={`conv-${conversation.id}`}
                />
            ))}
        </Nav>
    );
}

function Conversation({
    conversation,
    documentId,
}: {
    conversation: IConversation;
    documentId: string;
}) {
    const router = useRouter();
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
                        window.openai.deleteConversation(conversation.id);
                        router.push(`/chat/${documentId}`);
                    },
                },
            ]}
        />
    );
}
