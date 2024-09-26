import { CiSettings } from "react-icons/ci";
import Message from "./Message";
import { ReactNode, useEffect, useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import { ScrollArea } from "../ui/ScrollArea";
import { IChatStatus } from "shared/types/conversation";

export default function ChatRoot({
    children,
    chatAgent = "Document",
}: {
    children: ReactNode;
    chatAgent?: string;
}) {
    const { messages, streamMessage, onStreamEnd } = useChat();
    const [streamEnd, setStreamEnd] = useState<boolean>(false);
    const [chatStatus, setChatStatus] = useState<IChatStatus>();

    useEffect(() => {
        window.openai.onChatStream(
            (chunk) => {
                streamMessage(chunk.choices[0]?.delta?.content || "");
            },
            (result) => {},
            () => setStreamEnd(true),
        );
    }, []);

    useEffect(() => {
        window.openai.onChatStatus((chatStatus) => setChatStatus(chatStatus));
    }, []);

    useEffect(() => {
        if (streamEnd) {
            onStreamEnd();
            setStreamEnd(false);
        }
    }, [streamEnd]);

    return (
        <div className="grid grid-cols-1 grid-rows-[60px_1fr] h-[calc(100vh-200px)] place-content-center w-full mt-8 pt-6 p-3 rounded-2xl">
            <div className="relative">
                <h1 className="text-white text-3xl text-center">
                    Chating With {chatAgent}
                </h1>
                <CiSettings className="text-white text-3xl fixed bottom-8 right-8 cursor-pointer bg-primary hover:scale-110 rounded-full w-12 h-12 p-2 transition-all duration-300" />
            </div>
            <div className="grid grid-cols-1 grid-rows-[1fr_10px_100px] rounded-xl gap-y-4 min-h-full">
                <ScrollArea className="flex flex-col">
                    {messages?.length > 0 &&
                        messages.map((message) => (
                            <Message message={message} key={message.id} />
                        ))}
                </ScrollArea>
                {children}
                {chatStatus?.isLoading && chatStatus.message && (
                    <div className="flex gap-x-1 justify-start items-end">
                        <span className="text-neutral-400 font-bold">
                            {chatStatus?.message}
                        </span>
                        <div className="mb-1.5 h-1 w-1 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="mb-1.5 h-1 w-1 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="mb-1.5 h-1 w-1 bg-neutral-400 rounded-full animate-bounce"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
