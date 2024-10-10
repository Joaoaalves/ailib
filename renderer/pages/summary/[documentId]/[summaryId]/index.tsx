"use client";
import Layout from "@/components/Layout";
import SummaryList from "@/components/Summary/SummaryList";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ISummary } from "shared/types/summary";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Button } from "@/components/ui/Button";
import CopyClipboardButton from "@/components/ui/CopyClipboardButton";

export default function Page() {
    const [summary, setSummary] = useState<ISummary>();
    const { summaryId, documentId } = useParams<{
        summaryId: string;
        documentId: string;
    }>();

    const getSummary = async () => {
        const summary = await window.api.summary.get(summaryId as string);
        setSummary(summary);
    };

    useEffect(() => {
        getSummary();
    }, [summaryId]);

    return (
        <Layout sidePanelLinks={<SummaryList documentId={documentId} />}>
            <div className="grid grid-cols-1 grid-rows-1 p-8 text-white bg-[#111111] m-4 rounded-lg relative">
                <CopyClipboardButton
                    text={summary.text}
                    className="sticky top-8 ms-auto z-[9999]"
                />
                {summary && (
                    <MarkdownRenderer>{summary?.text}</MarkdownRenderer>
                )}
            </div>
        </Layout>
    );
}
