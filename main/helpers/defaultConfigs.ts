import { IConfig } from "shared/types/config";
import Config from "../db/config";

const defaultConfigs : IConfig[] = [
    {
        key: "openaiAPIKey",
        value: "",
        niceName: "OpenAI API Key",
    },
    {
        key: "embeddingModel",
        value: "text-embedding-3-small",
        niceName: "Embedding Model",
    },
    {
        key: "conversationModel",
        value: "gpt-4o-mini",
        niceName: "Conversation Model",
    },
];
export default async function createDefaultConfigsIfNotExists() {
    try {
        await Config.bulkCreate(defaultConfigs, {
            ignoreDuplicates: true
        })
        console.log("Configurações padrão verificadas/criadas.");
    } catch (error) {
        console.error("Erro ao criar configurações padrão:", error);
    }
}
