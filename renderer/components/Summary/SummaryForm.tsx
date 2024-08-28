import { useEffect, useState } from "react";
import Input from "@/components/ui/Input";
import { IDocument } from "shared/types/document";
import { useParams } from "next/navigation";
import { usePDFJS } from "@/hooks/usePDFJS";
import { Label } from "@/components/ui/Label";
import InputGroup from "@/components/ui/InputGroup";

export default function SummaryForm() {
    const [document, setDocument] = useState<IDocument>();

    const { documentId } = useParams();

    const [startingPage, setStartingPage] = useState<number>(1);
    const [endingPage, setEndingPage] = useState<number>(2);
    const [summaryTitle, setSummaryTitle] = useState<string>("");

    const getDocument = async () => {
        const doc = await window.backend.getDocument(documentId as string);
        setDocument(doc);
    };

    useEffect(() => {
        getDocument();
    }, []);

    const summarizePages = usePDFJS(async (pdfjs) => {
        const getPageText = async (pdf, pageNo: number): Promise<string> => {
            const page = await pdf.getPage(pageNo);
            const tokenizedText = await page.getTextContent();
            const pageText: string = tokenizedText.items
                .map((token) => token.str)
                .join("");
            return pageText;
        };

        const pdf = await pdfjs.getDocument(document.path).promise;

        const pageTextPromises = [];
        for (let pageNo = startingPage; pageNo <= endingPage; pageNo += 1) {
            pageTextPromises.push(getPageText(pdf, pageNo));
        }
        const pages: string[] = await Promise.all(pageTextPromises);

        window.openai.summarizePages(document.id, pages, summaryTitle);
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
                <Input
                    id="title"
                    type="text"
                    value={summaryTitle}
                    onChange={(e) => setSummaryTitle(e.target.value)}
                />
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
                        value={startingPage}
                        onChange={(e) =>
                            setStartingPage(Number(e.target.value))
                        }
                    />
                </InputGroup>

                <InputGroup>
                    <Label
                        className="text-white font-bold text-md"
                        htmlFor="ending-page"
                    >
                        To:
                    </Label>
                    <Input
                        id="ending-page"
                        type="number"
                        value={endingPage}
                        onChange={(e) => setEndingPage(Number(e.target.value))}
                    />
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
