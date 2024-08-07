import styles from "./Form.module.css"
import { ReactNode } from "react"
import { FormEventHandler } from "react"

interface FormProps{
    onSubmit: FormEventHandler<HTMLFormElement>,
    children: ReactNode
}

export default function Form({onSubmit, children}:FormProps){
    return <form className={styles.form} onSubmit={onSubmit}>
        {children}
    </form>
}