import { useEffect, useRef } from "react";
import Input from "@/components/ui/Input";
import { IDocument } from "shared/types/document";
import { usePDFJS } from "@/hooks/use-pdfjs";
import { Label } from "@/components/ui/Label";
import InputGroup from "@/components/ui/InputGroup";
import { useSummaryDocument } from "@/contexts/SummaryProvider";

export default function SummaryForm({ documentId }) {
    const document = useRef<IDocument>();
    const startingPage = useRef<HTMLInputElement>();
    const endingPage = useRef<HTMLInputElement>();
    const title = useRef<HTMLInputElement>();
    const { isSummaryzing, progress } = useSummaryDocument();

    const getDocument = async () => {
        document.current = await window.api.document.get(documentId as string);
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

        window.api.summary.summarizePages(
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
            {isSummaryzing && (
                <div className="h-2 bg-black rounded-xl w-full flex">
                    <div
                        className={"bg-primary rounded-xl h-2"}
                        style={{
                            width: `${progress}%`,
                        }}
                    ></div>
                </div>
            )}
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
                disabled={isSummaryzing}
            />
        </form>
    );
}
