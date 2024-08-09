"use client"
import styles from "./page.module.css";
import { useState, useEffect } from "react";
import Sidepanel from "@/components/Sidepanel/Sidepanel";
import TopBar from "@/components/Topbar/Topbar";
import { invoke } from "@tauri-apps/api";
import { useParams } from 'next/navigation';
import { readBinaryFile } from '@tauri-apps/api/fs';

export default function Page() {
    const [file, setFile] = useState<string | null>(null);
    const { document_id } = useParams(); 

    const fetchPdf = async (id: number) => {
        try {
            const pdfPath = await invoke<string>("get_document_path_by_id", { id });
            const pdfData = await readBinaryFile(pdfPath);
            const pdfUrl = URL.createObjectURL(new Blob([pdfData], { type: "application/pdf" }));
            setFile(pdfUrl);
        } catch (error) {
            console.error("Failed to fetch PDF:", error);
        }
    };

    useEffect(() => {
        if (document_id) {
            fetchPdf(Number(document_id));
        }
    }, [document_id]);

    return (
        <main className={styles.main}>
            <TopBar />
            <Sidepanel />
            <div className={styles.content}>
                {file && (
                    <iframe
                        src={file}
                        width="100%"
                        height="100%"
                        title="PDF Viewer"
                        style={{
                            border: "none"
                        }}
                    ></iframe>
                )}
            </div>
        </main>
    );
}
