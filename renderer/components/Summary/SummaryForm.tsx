import { useEffect, useRef, useState } from "react";
import Input from "@/components/ui/Input";
import { IDocument } from "shared/types/document";
import { useParams } from "next/navigation";
import { usePDFJS } from "@/hooks/usePDFJS";
import { Label } from "@/components/ui/Label";
import InputGroup from "@/components/ui/InputGroup";

export default function SummaryForm() {
    const document = useRef<IDocument>();
    const startingPage = useRef<HTMLInputElement>();
    const endingPage = useRef<HTMLInputElement>();
    const title = useRef<HTMLInputElement>();

    const { documentId } = useParams();

    const getDocument = async () => {
        document.current = await window.backend.getDocument(
            documentId as string,
        );
    };

    useEffect(() => {
        getDocument();
    }, []);

    const summarizePages = usePDFJS(async (pdfjs) => {
        if (!document?.current) return;

        const getPageText = async (pdf, pageNo: number): Promise<string> => {
            const page = await pdf.getPage(pageNo);
            const tokenizedText = await page.getTextContent();
            const pageText: string = tokenizedText.items
                .map((token) => token.str)
                .join("");
            return pageText;
        };

        const pdf = await pdfjs.getDocument(document.current.path).promise;

        const pageTextPromises = [];
        for (
            let pageNo = Number(startingPage.current.value);
            pageNo <= Number(endingPage.current.value);
            pageNo += 1
        ) {
            pageTextPromises.push(getPageText(pdf, pageNo));
        }
        const pages: string[] = await Promise.all(pageTextPromises);

        window.openai.summarizePages(
            document.current.id,
            pages,
            title.current.value,
        );
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        summarizePages();
    };

    return (
        <form className="space-y-8 p-8" onSubmit={handleSubmit}>
            <InputGroup>
                <Label className="text-white font-bold text-md" htmlFor="title">
                    Summary Title
                </Label>
                <Input id="title" type="text" ref={title} />
            </InputGroup>
            <div className="grid grid-cols-2 gap-x-8">
                <InputGroup>
                    <Label
                        className="text-white font-bold text-md"
                        htmlFor="starting-page"
                    >
                        From page:
                    </Label>
                    <Input
                        id="starting-page"
                        type="number"
                        ref={startingPage}
                    />
                </InputGroup>

                <InputGroup>
                    <Label
                        className="text-white font-bold text-md"
                        htmlFor="ending-page"
                    >
                        To:
                    </Label>
                    <Input id="ending-page" type="number" ref={endingPage} />
                </InputGroup>
            </div>

            <Input
                className="hover:bg-neutral-100 hover:text-black font-black text-md cursor-pointer transition-all duration-300"
                type="submit"
                value="Summarize"
            />
        </form>
    );
}
