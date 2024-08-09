import styles from "./Collection.module.css"
import { IDocument } from "@/types/document"
import { ICollection } from "@/types/collection"
import Document from "./Document"

interface CollectionProps{
    documents: IDocument[] | [],
    collection: ICollection
}

export default function Collection({documents=[], collection}:CollectionProps){
    return <div className={styles.Collection}>
        <h2 className={styles.title}>{collection.name}</h2>
        <div className={styles.documents}>
            {documents.length > 0 && documents.map(
                (document) => (
                    <Document document={document} key={document.id}/>
                )
            )}
        </div>
    </div>
}