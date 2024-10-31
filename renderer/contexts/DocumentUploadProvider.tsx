import React, {
    createContext,
    useState,
    useEffect,
    ReactNode,
    useContext,
} from "react";
import { useRouter } from "next/navigation";

interface IProgressContext {
    progress: number;
    isEmbedding: boolean;
}

const ProgressContext = createContext<IProgressContext | undefined>(undefined);

const DocumentUploadProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const router = useRouter();
    const [progress, setProgress] = useState<number>(null);
    const [isEmbedding, setIsEmbedding] = useState<boolean>(false);

    useEffect(() => {
        const handleProgress = (prog: number) => {
            console.log(prog);
            setIsEmbedding(true);
            if (!progress || prog > progress) setProgress(prog);
        };

        if (window.api?.openai && window.api?.openai.embeddingProgress) {
            window.api.openai.embeddingProgress(handleProgress, () =>
                router.refresh(),
            );
        }
    }, []);
    return (
        <ProgressContext.Provider value={{ progress, isEmbedding }}>
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
