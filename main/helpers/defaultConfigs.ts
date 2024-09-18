import Config from "../db/config";

const defaultConfigs = [
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
        await Promise.all(
            defaultConfigs.map(async (config) => {
                await Config.findOrCreate({
                    where: { key: config.key }, // Verifica se já existe
                    defaults: {
                        value: config.value, // Se não existir, cria com o valor default
                        niceName: config.niceName,
                    },
                });
            }),
        );
        console.log("Configurações padrão verificadas/criadas.");
    } catch (error) {
        console.error("Erro ao criar configurações padrão:", error);
    }
}
