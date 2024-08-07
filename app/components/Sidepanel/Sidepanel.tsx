"use client"

import NewCollection from "../NewCollection/NewCollection"
import styles from "./Sidepanel.module.css"
import FileUploader from "@/components/FileUploader/FileUploader"

export default function Sidepanel(){


    return (
    <aside className={styles.sidepanel}>
        <FileUploader />
        <NewCollection />
    </aside>
    )
}