import { IConfig } from "shared/types/config";
import Config from "../db/config";

const defaultConfigs: IConfig[] = [
    {
        key: "openaiAPIKey",
        description:
            "Your OpenAI API key is required to connect to OpenAI services for generating embeddings and conversations.",
        value: "",
        niceName: "OpenAI API Key",
        type: "text",
    },
    {
        key: "embeddingModel",
        description:
            "Select the model used for generating embeddings from text. Larger models provide better accuracy but require more resources.",
        value: "text-embedding-3-small",
        niceName: "Embedding Model",
        allowedValues: [
            "text-embedding-3-small",
            "text-embedding-3-large",
            "text-embedding-ada-002",
        ],
        type: "select",
    },
    {
        key: "conversationModel",
        description:
            "Choose the model used for conversations. GPT-4o offers better contextual understanding, while GPT-4o-mini is more lightweight.",
        value: "gpt-4o-mini",
        niceName: "Conversation Model",
        allowedValues: ["gpt-4", "gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
        type: "select",
    },
    {
        key: "hydeEnabled",
        description:
            "Enable or disable HyDE (Hypothetical Document Embeddings). When enabled, HyDE generates hypothetical documents to enhance retrieval accuracy.",
        value: "true",
        niceName: "Enable HyDE",
        type: "boolean",
    },
    {
        key: "hydeModel",
        description:
            "Select the model used by HyDE for generating hypothetical documents to assist in document embeddings.",
        value: "gpt-4o-mini",
        niceName: "HyDE Model",
        allowedValues: ["gpt-4", "gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
        type: "select",
    },
    {
        key: "selfQueryRetrievalEnabled",
        description:
            "Enable or disable Self Query Retrieval. When enabled, the system will generate queries to retrieve the most relevant documents automatically.",
        value: "true",
        niceName: "Enable Self Query Retrieval",
        type: "boolean",
    },
    {
        key: "selfQueryRetrievalModel",
        description:
            "Select the model used for Self Query Retrieval. This model is responsible for generating queries to retrieve relevant information.",
        value: "gpt-4o-mini",
        niceName: "Self Query Retrieval Model",
        allowedValues: ["gpt-4", "gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
        type: "select",
    },
    {
        key: "summaryModel",
        description:
            "Select the model used for generating document summaries. A more powerful model will create more accurate summaries.",
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
