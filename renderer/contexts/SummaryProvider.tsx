import React, {
    createContext,
    useState,
    useEffect,
    ReactNode,
    useContext,
} from "react";
import { useRouter } from "next/navigation";

interface ISummaryContext {
    progress: number;
    isSummaryzing: boolean;
}

const SummaryContext = createContext<ISummaryContext | undefined>(undefined);

const DocumentSummaryProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const router = useRouter();
    const [isSummaryzing, setIsSummaryzing] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(null);

    useEffect(() => {
        const handleProgress = (data: { progress: number }) => {
            setIsSummaryzing(true);
            setProgress(data.progress);
        };

        if (window.openai && window.openai.summaryzingProgress) {
            window.openai.summaryzingProgress(handleProgress, () =>
                router.refresh(),
            );
        }
    }, []);

    return (
        <SummaryContext.Provider value={{ progress, isSummaryzing }}>
            {children}
        </SummaryContext.Provider>
    );
};

const useSummaryDocument = (): ISummaryContext => {
    const context = useContext(SummaryContext);
    if (context === undefined) {
        throw new Error(
            "useSummaryDocument must be used within a DocumentSummaryProvider",
        );
    }
    return context;
};

export { DocumentSummaryProvider, useSummaryDocument };
