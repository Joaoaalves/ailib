import { useEffect, useRef, useState } from 'react';
// @ts-expect-error
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import 'pdfjs-dist/web/pdf_viewer.css';
import { IDocument } from 'shared/types/document';

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PDFViewerProps {
  document: IDocument,
  path: string
}

export default function PDFViewer({document, path }: PDFViewerProps) {
  const [currentPage, setCurrentPage] = useState<number>(document.lastPageRead);
  const [totalPages, setTotalPages] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadPdf = async () => {
      const loadingTask = pdfjsLib.getDocument(path);
      const pdf = await loadingTask.promise;

      // Set the total number of pages
      setTotalPages(pdf.numPages);

      const page = await pdf.getPage(currentPage);

      const canvas = canvasRef.current!;
      const context = canvas.getContext('2d')!;
      const viewport = page.getViewport({ scale: 2 });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport,
      };

      page.render(renderContext);
    };

    loadPdf();
  }, [path, currentPage]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') {
        handleNextPage();
      } else if (event.key === 'ArrowLeft') {
        handlePrevPage();
      }
    };

    window.backend.setLastPageRead(document.id, currentPage);

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage]);

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

  return (
    <div className='relative'>
      <canvas ref={canvasRef} className="mx-auto mt-8 w-[800px] h-full" />
      <div className='fixed bg-container p-2 rounded-lg bottom-2 left-[calc(50%+150px)] -translate-x-1/2 flex items-center justify-center gap-x-8'>
        <button onClick={handlePrevPage} className='bg-primary py-2 px-8 rounded-md text-white shadow-lg'>Prev</button>
        <span className='text-white'>{`Page ${currentPage} of ${totalPages}`}</span>
        <button onClick={handleNextPage} className='bg-primary py-2 px-8 rounded-md text-white shadow-lg'>Next</button>
      </div>
    </div>
  );
}
