import { ChangeEvent, HTMLInputTypeAttribute } from "react";

interface InputProps {
    type: HTMLInputTypeAttribute;
    className?: string;
    placeholder?: string;
    value: string | number;
    id?: string;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function Input({
    type,
    className,
    placeholder,
    value,
    onChange,
    id,
}: InputProps) {
    return (
        <input
            type={type}
            className={`${className} w-full border rounded-md px-4 py-2 text-white bg-black border-neutral-400`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            id={id}
        />
    );
}
