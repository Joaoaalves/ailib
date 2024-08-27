"use client";
import { useEffect, useRef, useState } from "react";
import { IDocument } from "shared/types/document";
import { usePDFJS } from "@/hooks/usePDFJS";

interface PDFViewerProps {
    document: IDocument;
    path: string;
    page?: number;
}

export default function PDFViewer({ document, path, page }: PDFViewerProps) {
    const [currentPage, setCurrentPage] = useState<number>(
        page ? page : document.lastPageRead,
    );
    const [totalPages, setTotalPages] = useState<number>(document.totalPages);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [pdf, setPdf] = useState<any>(null);

    const loadPdf = usePDFJS(
        async (pdfjs) => {
            try {
                const loadingTask = pdfjs.getDocument(path);
                const loadedPdf = await loadingTask.promise;
                setPdf(loadedPdf);
                setTotalPages(loadedPdf.numPages);
            } catch (error) {
                console.error(error);
            }
        },
        [path],
    );

    useEffect(() => {
        loadPdf();
    }, [loadPdf]);

    useEffect(() => {
        const renderPage = async () => {
            if (pdf && canvasRef.current) {
                const page = await pdf.getPage(currentPage);
                const canvas = canvasRef.current;
                const context = canvas.getContext("2d")!;
                const viewport = page.getViewport({ scale: 2 });

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport,
                };

                page.render(renderContext);
            }
        };

        renderPage();
    }, [pdf, currentPage]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowRight") {
                handleNextPage();
            } else if (event.key === "ArrowLeft") {
                handlePrevPage();
            }
        };

        window.backend.setLastPageRead(document.id, currentPage);

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [currentPage, document.id]);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePageChange = (value: string) => {
        const num = Number(value);

        if (num > 0 && num <= totalPages) {
            setCurrentPage(num);
        }
    };

    return (
        <div className="grid items-center w-full h-full">
            <div className="relative">
                <canvas
                    ref={canvasRef}
                    className="mx-auto mt-8 w-[800px] h-full rounded-lg shadow-neutral-400 shadow-lg"
                />
                <div className="fixed bg-container p-2 rounded-lg bottom-2 left-[calc(50%+150px)] -translate-x-1/2 flex items-center justify-center gap-x-8">
                    <button
                        onClick={handlePrevPage}
                        className="bg-primary py-2 px-8 rounded-md text-white shadow-lg"
                    >
                        Prev
                    </button>
                    <span className="text-white">
                        Page{" "}
                        <input
                            type="number"
                            min={1}
                            value={currentPage}
                            className="bg-transparent border-none w-12 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500
        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-center underline"
                            onChange={(e) => handlePageChange(e.target.value)}
                        />
                        {` of ${totalPages}`}
                    </span>
                    <button
                        onClick={handleNextPage}
                        className="bg-primary py-2 px-8 rounded-md text-white shadow-lg"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
