import { ChangeEventHandler, ReactNode } from "react"
import style from "./Select.module.css"

interface SelectProps{
    children: ReactNode,
    onChange: ChangeEventHandler<HTMLSelectElement>
}

interface SelectOptionProps{
    value: string | number | readonly string[] | undefined,
    children: ReactNode
}

export function Select({children, onChange}:SelectProps){
    return (
        <select className={style.select} onChange={onChange}>
            {children}        
        </select>
    )
}

export function SelectOption({value, children}:SelectOptionProps){
    return (
        <option value={value} className={style.option}>{children}</option>
    )
}