"use client";
import { useEffect, useState } from "react";
import * as PDFJS from "pdfjs-dist/types/src/pdf";

// Hook that loads PDFJS and returns a function to use within an onSubmit handler
export const usePDFJS = (onLoad: (pdfjs: typeof PDFJS) => Promise<void>, deps: (string | number | boolean | undefined | null)[] = []) => {
  const [pdfjs, setPDFJS] = useState<typeof PDFJS | null>(null);

  useEffect(() => {
    import("pdfjs-dist/webpack.mjs").then(module => setPDFJS(module));
  }, []);

  const executeOnLoad = async () => {
    if (!pdfjs) return;
    await onLoad(pdfjs);
  };

  // Return the execute function to be used in onSubmit
  return executeOnLoad;
};
