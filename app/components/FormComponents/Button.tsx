import styles from "./Button.module.css"
import { MouseEventHandler } from "react";

import { ReactNode } from "react";

interface ButtonProps{
    type?: "submit" | "button",
    onClick?: MouseEventHandler<HTMLButtonElement>,
    disabled?: boolean,
    children?: ReactNode,
    variant?: "normal" | "outline"
}

export default function Button({type="submit", onClick, disabled=false, variant="normal", children}: ButtonProps){
    return (
        <button type={type} onClick={onClick} disabled={disabled} className={variant === "normal" ? `${styles.button} ${styles.filled}`
            : `${styles.button} ${styles.outline}`
        }>
            {children}
        </button>
    )
}