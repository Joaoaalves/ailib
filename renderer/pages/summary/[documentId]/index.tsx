"use client";
import Layout from "@/components/Layout";
import Nav from "@/components/Sidepanel/Nav";
import SummaryForm from "@/components/Summary/SummaryForm";
import SummaryList from "@/components/Summary/SummaryList";

export default function Page() {
    return (
        <Layout sidePanelLinks={<SummaryList />}>
            <div>
                <h1 className="text-white text-xl text-center mt-8">
                    Summarizer
                </h1>
                <SummaryForm />
            </div>
        </Layout>
    );
}
