import { IConfig } from "shared/types/config";
import Config from "../db/config";

const defaultConfigs: IConfig[] = [
    {
        key: "openaiAPIKey",
        value: "",
        niceName: "OpenAI API Key",
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
    },
    {
        key: "conversationModel",
        value: "gpt-4o-mini",
        niceName: "Conversation Model",
        allowedValues: ["gpt-4", "gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"],
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
