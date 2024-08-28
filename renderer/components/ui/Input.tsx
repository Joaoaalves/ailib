import React from "react";
import { ChangeEvent, HTMLInputTypeAttribute } from "react";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={`${className} w-full border rounded-md px-4 py-2 text-white bg-black border-neutral-400`}
                ref={ref}
                {...props}
            />
        );
    },
);

export default Input;
