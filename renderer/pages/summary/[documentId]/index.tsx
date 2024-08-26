"use client"
import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { useParams } from "next/navigation";
import Nav from "@/components/Sidepanel/Nav";
import Input from "@/components/ui/Input";
import { usePDFJS } from "@/hooks/usePDFJS";
import { IDocument } from "shared/types/document";

export default function Page(){
    const [document, setDocument] = useState<IDocument>()

    const { documentId } = useParams();

    const [startingPage, setStartingPage] = useState<number>(1)
    const [endingPage, setEndingPage] = useState<number>(2)
    const [summaryTitle, setSummaryTitle] = useState<string>("")

    const summarizePages = usePDFJS(async (pdfjs) => {

        const getPageText = async (pdf, pageNo: number) : Promise<string> => {
            const page = await pdf.getPage(pageNo);
            const tokenizedText = await page.getTextContent();
            const pageText : string = tokenizedText.items.map(token => token.str).join("");
            return pageText;
          };

        const pdf = await pdfjs.getDocument(document.path).promise
        const maxPages = pdf.numPages;
        const pageTextPromises = [];
        for (let pageNo = startingPage; pageNo <= endingPage; pageNo += 1) {
          pageTextPromises.push(getPageText(pdf, pageNo));
        }
        const pages: string[] = await Promise.all(pageTextPromises);
        
        window.openai.summarizePages(document.id, pages, summaryTitle)
    })

    const getDocument = async () => {
        const doc = await window.backend.getDocument(documentId as string)
        setDocument(doc);
        console.log(doc)
    }

    useEffect(() => {
        getDocument()
    }, [])


    const handleSubmit = (e:React.FormEvent) => {
        e.preventDefault()
        summarizePages()
    }
    return (
        <Layout sidePanelLinks={ <Nav> Resumos </Nav>}>
            <div>
                <h1>Summarizer</h1>
                <form onSubmit={handleSubmit}>
                    <Input type="text" value={summaryTitle} onChange={(e) => setSummaryTitle(e.target.value)} />

                    <Input type="number" value={startingPage} onChange={(e) => setStartingPage(Number(e.target.value))}/>
                    to
                    <Input type="number" value={endingPage} onChange={(e) => setEndingPage(Number(e.target.value))}/>

                    <Input type="submit" value="Resumir" />
                </form>
            </div>
        </Layout>
    )
}