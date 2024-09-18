"use client";
import { useCallback, useEffect, useState } from "react";
import * as PDFJS from "pdfjs-dist/types/src/pdf";

// Hook that loads PDFJS and returns a function to use within an onSubmit handler
export const usePDFJS = (
    onLoad: (pdfjs: typeof PDFJS) => Promise<void>,
    deps: (string | number | boolean | undefined | null)[] = [],
) => {
    const [pdfjs, setPDFJS] = useState<typeof PDFJS | null>(null);

    useEffect(() => {
        const loadPDFJS = async () => {
            const module = await import("pdfjs-dist/webpack.mjs");
            setPDFJS(module);
        };

        loadPDFJS();
    }, []);

    const executeOnLoad = useCallback(async () => {
        if (!pdfjs) return;
        await onLoad(pdfjs);
    }, [pdfjs]);

    // Return the execute function to be used in onSubmit
    return executeOnLoad;
};
