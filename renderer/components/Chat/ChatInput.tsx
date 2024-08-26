import { useChat } from "@/contexts/ChatContext";
import { Textarea } from "../ui/TextArea";
import { forwardRef, ForwardedRef, useState, KeyboardEvent } from "react";

type ChatInputProps = {};

const ChatInput = forwardRef<HTMLTextAreaElement, ChatInputProps>(
    (props, ref: ForwardedRef<HTMLTextAreaElement>) => {
        const [message, setMessage] = useState<string>("");
        const { sendMessage } = useChat();

        const handleSubmit = () => {
            if (message.trim()) {
                sendMessage(message);
                setMessage("");
            }
        };

        const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
            }
        };

        return (
            <Textarea
                className="text-white font-bold bg-container shadow-primary border-none h-28 row-start-2"
                ref={ref}
                id="input"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                {...props}
            />
        );
    },
);

ChatInput.displayName = "ChatInput";

export default ChatInput;
