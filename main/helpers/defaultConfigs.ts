import Configuration from "../db/configuration";

const defaultConfigurations = {
    openaiAPIKey: "",
    embeddingModel: "text-embedding-3-small",
    conversationModel: "gpt-4o-mini",
};

export default async function createDefaultConfigsIfNotExists() {
    for (const [key, value] of Object.entries(defaultConfigurations)) {
        await Configuration.findOrCreate({
            where: { key },
            defaults: {
                value,
            },
        });
    }
}
