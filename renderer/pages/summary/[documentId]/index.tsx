"use client";
import Layout from "@/components/Layout";
import SummaryForm from "@/components/Summary/SummaryForm";
import SummaryList from "@/components/Summary/SummaryList";
import { DocumentSummaryProvider } from "@/contexts/SummaryProvider";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
    const params = useParams<{ documentId: string }>();
    const [documentId, setDocumentId] = useState<string>();

    useEffect(() => {
        if (params?.documentId) setDocumentId(params.documentId);
    }, [params]);

    return (
        <Layout sidePanelLinks={<SummaryList documentId={documentId} />}>
            <DocumentSummaryProvider>
                {documentId ? (
                    <div>
                        <h1 className="text-white text-xl text-center mt-8">
                            Summarizer
                        </h1>
                        <SummaryForm documentId={documentId} />
                    </div>
                ) : (
                    <span>Loading...</span>
                )}
            </DocumentSummaryProvider>
        </Layout>
    );
}
