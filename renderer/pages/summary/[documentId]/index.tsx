"use client";
import Layout from "@/components/Layout";
import Nav from "@/components/Sidepanel/Nav";
import SummaryForm from "@/components/Summary/SummaryForm";

export default function Page() {
    return (
        <Layout sidePanelLinks={<Nav> Resumos </Nav>}>
            <div>
                <h1 className="text-white text-xl text-center mt-8">Summarizer</h1>
                <SummaryForm />
            </div>
        </Layout>
    );
}
