import { IoChatbubbleOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";

interface ChatBubbleProps {
    documentId: string;
}

export default function ChatBubble({ documentId }: ChatBubbleProps) {
    const router = useRouter();

    const handleChat = () => {
        router.push(`/chat/${documentId}/`);
    };

    return (
        <div
            onClick={handleChat}
            className="fixed right-12 bottom-12 bg-primary rounded-full p-2 hover:scale-105 transition-all duration-300 cursor-pointer"
        >
            <IoChatbubbleOutline className="text-white text-3xl" />
        </div>
    );
}
