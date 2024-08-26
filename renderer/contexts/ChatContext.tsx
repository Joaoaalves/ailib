import React, {
    createContext,
    useState,
    ReactNode,
    useContext,
    useCallback,
    useEffect,
} from "react";
import { IConversation, IMessage } from "shared/types/conversation";

interface ChatProviderProps {
    children: ReactNode;
    documentId: string;
    conversationId?: string;
}

interface ChatContextProps {
    messages: IMessage[];
    setMessages: React.Dispatch<React.SetStateAction<IMessage[]>>;
    sendMessage: (content: string) => void;
    streamMessage: (content: string) => void;
    onStreamEnd: () => void;
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

const ChatProvider: React.FC<ChatProviderProps> = ({
    children,
    documentId,
    conversationId,
}) => {
    const [messages, setMessages] = useState<IMessage[]>([]);
    const [conversation, setConversation] = useState<IConversation>();

    const getConversation = async () => {
        const conv: IConversation =
            await window.backend.getConversation(conversationId);
        setMessages(conv.Messages);
        setConversation(conv);
    };

    useEffect(() => {
        if (conversationId) getConversation();
    }, [conversationId]);

    const streamMessage = useCallback((content: string) => {
        setMessages((prevMessages) => {
            if (prevMessages.length === 0) return prevMessages;
            const updatedMessages = [...prevMessages];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage.role === "user") {
                const newMessage: IMessage = {
                    role: "assistant",
                    content: content,
                    updatedAt: new Date(),
                    createdAt: new Date(),
                };
                return [...updatedMessages, newMessage];
            }
            if (lastMessage.role === "assistant") {
                if (!lastMessage.content.endsWith(content)) {
                    lastMessage.content += content;
                    lastMessage.updatedAt = new Date();
                }
            }
            return updatedMessages;
        });
    }, []);

    const onStreamEnd = () => {
        window.backend.saveMessage(conversation.id, messages.at(-1));
    };

    const createConversationIfNotExists = async (message: IMessage) => {
        if (!conversation && !conversationId) {
            const conversation: IConversation =
                await window.backend.createConversation(message);
            setConversation(conversation);
            return conversation.id;
        }

        return conversation.id;
    };

    const sendMessage = async (content: string) => {
        const newMessage: IMessage = {
            role: "user",
            content: content,
            updatedAt: new Date(),
            createdAt: new Date(),
        };

        const convId = await createConversationIfNotExists(newMessage);

        setMessages((prevMessages) => {
            const newMessagesArr = [...prevMessages, newMessage];
            window.openai.chatWithDocument(newMessagesArr, documentId);
            window.backend.saveMessage(convId, newMessage);
            return newMessagesArr;
        });
    };

    return (
        <ChatContext.Provider
            value={{
                messages,
                setMessages,
                sendMessage,
                streamMessage,
                onStreamEnd,
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

const useChat = (): ChatContextProps => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error("useChat must be used within a ChatProvider");
    }
    return context;
};

export { ChatProvider, useChat };
