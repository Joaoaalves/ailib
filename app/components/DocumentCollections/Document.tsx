import { IDocument } from "@/types/document";
import styles from "./Document.module.css"
import { useRouter } from "next/navigation";
interface DocumentProps{
    document: IDocument
}

export default function Document({document}:DocumentProps){
    const router = useRouter()
 
    const handleClick = () => {
        router.push(`/document/${document.id}`)
    }
 
    return (
        <div className={styles.Document} onClick={handleClick}>
            <h4 className={styles.title}>{document.name}</h4>
        </div>
    )
}