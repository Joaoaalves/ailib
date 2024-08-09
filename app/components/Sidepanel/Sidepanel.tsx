"use client"
import FileUploader from "../FileUploader/FileUploader"
import styles from "./Sidepanel.module.css"


export default function Sidepanel(){


    return (
        <aside className={styles.sidepanel}>
            <FileUploader />
        </aside>
    )
}