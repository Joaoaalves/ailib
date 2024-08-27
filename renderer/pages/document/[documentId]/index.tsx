"use client";
import { IDocument } from "shared/types/document";
import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PDFViewer from "@/components/PDF/PDFReader";
import ChatBubble from "@/components/ChatBubble";

export default function Document() {
    const { documentId } = useParams();
    const [document, setDocument] = useState<IDocument | null>();

    const getDocument = async () => {
        try {
            const document = await window.backend.getDocument(
                documentId as string,
            );
            setDocument(document);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        getDocument();
    }, []);

    return (
        <Layout>
            {document && <PDFViewer document={document} path={document.path} />}
            <ChatBubble documentId={documentId as string} />
        </Layout>
    );
}
