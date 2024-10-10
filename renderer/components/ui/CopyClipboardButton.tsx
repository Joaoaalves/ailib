"use client";
import { Button } from "./Button";
import { LuClipboard, LuCheck } from "react-icons/lu";
import { useState } from "react";

interface CopyClipboardButtonProps {
    text: string;
    className?: string;
}

export default function CopyClipboardButton({
    text,
    className,
}: CopyClipboardButtonProps) {
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleCopy = () => {
        setIsCopied(true);
        navigator.clipboard.writeText(text);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <Button
            className={`flex bg-black w-8 h-8 p-0 hover:bg-neutral-800 transition-all duration-300 group ${className}`}
            onClick={handleCopy}
        >
            {isCopied ? <LuCheck /> : <LuClipboard />}
        </Button>
    );
}
