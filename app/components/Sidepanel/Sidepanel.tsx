"use client"
import FileUploader from "@/components/FileUploader/FileUploader"

import styles from "./Sidepanel.module.css"

export default function Sidepanel(){


    return (
    <aside className={styles.sidepanel}>
        <FileUploader />
    </aside>
    )
}