import type { IMessage } from "shared/types/conversation";
import { AiOutlineOpenAI, AiOutlineUser } from "react-icons/ai";
import { MarkdownRenderer } from "../MarkdownRenderer";

export default function Message({ message }: { message: IMessage }) {
    return (
        <div
            className={`flex gap-x-4 ${
                message.role == "user" ? "ms-auto flex-row-reverse" : "me-auto"
            }`}
        >
            <div className="bg-primary w-12 h-12 rounded-full grid place-items-center">
                {message.role == "user" ? (
                    <AiOutlineUser className="text-white text-4xl" />
                ) : (
                    <AiOutlineOpenAI className="text-white text-4xl" />
                )}
            </div>
            <div
                className={`text-white p-6 px-4 bg-container ${
                    message.role == "user"
                        ? "rounded-s-2xl rounded-ee-2xl"
                        : "rounded-e-2xl rounded-es-2xl"
                } shadow-primary w-[700px] mt-10`}
            >
                <MarkdownRenderer>{message.content}</MarkdownRenderer>
            </div>
        </div>
    );
}
