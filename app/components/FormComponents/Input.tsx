import styles from "./Input.module.css"
import { HTMLInputTypeAttribute } from "react";
import { ChangeEventHandler } from "react";

interface InputProps{
    type: HTMLInputTypeAttribute,
    value?: string | number | undefined,
    onChange?: ChangeEventHandler<HTMLInputElement>,
    placeholder?: string,
    required?: boolean
}

export default function Input({type, value, onChange, placeholder, required = false}: InputProps){
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className={styles.input}
        />
    )
}