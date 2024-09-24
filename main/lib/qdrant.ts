import { QdrantClient } from "@qdrant/js-client-rest";
import { v4 as uuid } from "uuid";
import { UpsertEmbeddingParams } from "shared/types/qdrant";
import Config from "../db/config";

export const client = createQdrantClient();

const largeCollectionName = "AILib-Large";
const smallCollectionName = "AILib-Small";

export async function ensureCollectionsExists(): Promise<void> {
    try {
        const smallCollection =
            await client.collectionExists(smallCollectionName);
        if (!smallCollection.exists) {
            await client.createCollection(smallCollectionName, {
                vectors: {
                    size: 1536,
                    distance: "Cosine",
                },
            });
        }

        const largeCollection =
            await client.collectionExists(largeCollectionName);
        if (!largeCollection.exists) {
            await client.createCollection(largeCollectionName, {
                vectors: {
                    size: 3072,
                    distance: "Cosine",
                },
            });
        }
    } catch (error) {
        console.error(error);
    }
}

async function getSelectedCollection() {
    const config = await Config.findByPk("embeddingModel");

    if (config.value == "text-embedding-3-large") return largeCollectionName;

    return smallCollectionName;
}

export async function upsertEmbedding({
    embedding,
    metadata,
}: UpsertEmbeddingParams): Promise<void> {
    const collection = await getSelectedCollection();
    const payload = {
        ...metadata,
    };

    const point = {
        id: uuid(),
        vector: embedding,
        payload: payload,
    };

    await client.upsert(collection, {
        points: [point],
    });
}

export function createQdrantClient() {
    return new QdrantClient({ url: "http://localhost:6333" });
}

export async function deletePointsForDocumentId(documentId: number) {
    const collection = await getSelectedCollection();
    await client.delete(collection, {
        filter: {
            must: [
                {
                    key: "documentId",
                    match: {
                        value: Number(documentId),
                    },
                },
            ],
        },
    });
}

export async function getMostRelevantItemsFromDocument(
    embeddedMessage: number[],
    limit: number = 5,
    filter?: Object,
): Promise<Object[]> {
    try {
        const collection = await getSelectedCollection();

        const result = await client.search(collection, {
            ...filter,
            with_vector: false,
            vector: embeddedMessage,
            with_payload: true,
            limit,
        });

        const docs = result.map((res) => ({
            id: res.id,
            documentId: res.payload.documentId,
            page: res.payload?.page,
            score: res.score,
            chunkId: res.payload.chunkId,
        }));

        return docs;
    } catch (error) {
        console.error(error);

        return [];
    }
}
