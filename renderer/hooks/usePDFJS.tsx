"use client";
import { useEffect, useState, useCallback } from "react";
import * as PDFJS from "pdfjs-dist/types/src/pdf";

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
        if (pdfjs) {
            await onLoad(pdfjs);
        }
    }, [pdfjs, ...deps]);

    return executeOnLoad;
};
