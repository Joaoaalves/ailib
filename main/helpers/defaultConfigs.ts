import { IConfig } from "shared/types/config";
import Config from "../db/config";

const defaultConfigs: IConfig[] = [
    {
        key: "openaiAPIKey",
        value: "",
        niceName: "OpenAI API Key",
        type: "text",
    },
    {
        key: "embeddingModel",
        value: "text-embedding-3-small",
        niceName: "Embedding Model",
        allowedValues: [
            "text-embedding-3-small",
            "text-embedding-2-large",
            "text-embedding-ada-002",
        ],
        type: "select",
    },
    {
        key: "conversationModel",
        value: "gpt-4o-mini",
        niceName: "Conversation Model",
        allowedValues: ["gpt-4", "gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
        type: "select",
    },
    {
        key: "hydeEnabled",
        value: "true",
        niceName: "Enable HyDE (Hypotethical Document Embeddings)",
        type: "boolean",
    },
    {
        key: "hydeModel",
        value: "gpt-4o-mini",
        niceName: "HyDE Model",
        allowedValues: ["gpt-4", "gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
        type: "select",
    },
    {
        key: "selfQueryRetrievalEnabled",
        value: "true",
        niceName: "Enable Self Query Retrieval",
        type: "boolean",
    },
    {
        key: "selfQueryRetrievalModel",
        value: "gpt-4o-mini",
        niceName: "Self Query Retrieval Model",
        allowedValues: ["gpt-4", "gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
        type: "select",
    },
    {
        key: "summaryModel",
        value: "gpt-4o-mini",
        niceName: "Summary Model",
        allowedValues: ["gpt-4", "gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
        type: "select",
    },
];

export default async function createDefaultConfigsIfNotExists() {
    try {
        await Config.bulkCreate(defaultConfigs, {
            ignoreDuplicates: true,
        });
        console.log("Configurações padrão verificadas/criadas.");
    } catch (error) {
        console.error("Erro ao criar configurações padrão:", error);
    }
}
