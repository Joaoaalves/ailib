import styles from "./Button.module.css"
import { MouseEventHandler } from "react";

import { ReactNode } from "react";

interface ButtonProps{
    type?: "submit" | "button",
    onClick?: MouseEventHandler<HTMLButtonElement>,
    disabled?: boolean,
    children?: ReactNode
}

export default function Button({type="submit", onClick, disabled=false, children}: ButtonProps){
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={styles.button}>
            {children}
        </button>
    )
}