import React, {
    createContext,
    useState,
    useEffect,
    ReactNode,
    useContext,
} from "react";
import { useRouter } from "next/navigation";
interface IProgress {
    chunk: number;
    total: number;
    embedding: string;
}

interface IProgressContext {
    progressPercentage: number;
    isEmbedding: boolean;
    embeddingCost: number;
}

const ProgressContext = createContext<IProgressContext | undefined>(undefined);

const DocumentUploadProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const router = useRouter();
    const [progress, setProgress] = useState<IProgress | null>(null);
    const [isEmbedding, setIsEmbedding] = useState<boolean>(false);
    const [embeddingCost, setEmbeddingCost] = useState<number>();

    useEffect(() => {
        const handleProgress = (prog: IProgress) => {
            setIsEmbedding(true);
            if(!progress || prog.chunk > progress.chunk)
                setProgress(prog);
        };

        if (window.openai && window.openai.embeddingProgress) {
            window.openai.embeddingProgress(handleProgress, () =>
                router.refresh(),
            );
        }

        if (window.openai && window.openai.embeddingCost) {
            window.openai.embeddingCost((cost: number) =>
                setEmbeddingCost(cost),
            );
        }
    }, []);

    const progressPercentage = progress
        ? (progress.chunk * 100) / progress.total
        : 0;

    return (
        <ProgressContext.Provider
            value={{ progressPercentage, isEmbedding, embeddingCost }}
        >
            {children}
        </ProgressContext.Provider>
    );
};

const useUploadDocument = (): IProgressContext => {
    const context = useContext(ProgressContext);
    if (context === undefined) {
        throw new Error(
            "useUploadDocument must be used within a DocumentUploadProvider",
        );
    }
    return context;
};

export { DocumentUploadProvider, useUploadDocument };
