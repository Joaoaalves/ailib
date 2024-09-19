import { QdrantClient } from "@qdrant/js-client-rest";
import { v4 as uuid } from "uuid";
import { UpsertEmbeddingParams } from "shared/types/qdrant";

export const client = createQdrantClient();

const qdrantCollection = "AILib";

export async function ensureCollectionExists(): Promise<void> {
    try {
        await client.createCollection(qdrantCollection, {
            vectors: {
                size: 1536,
                distance: "Cosine",
            },
        });
    } catch (error) {
        //
    }
}

export async function upsertEmbedding({
    embedding,
    metadata,
}: UpsertEmbeddingParams): Promise<void> {
    const payload = {
        ...metadata,
    };

    const point = {
        id: uuid(),
        vector: embedding,
        payload: payload,
    };

    await client.upsert(qdrantCollection, {
        points: [point],
    });
}

export function createQdrantClient() {
    return new QdrantClient({ url: "http://localhost:6333" });
}

export async function deletePointsForDocumentId(documentId: number) {
    await client.delete(qdrantCollection, {
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
        const result = await client.search(qdrantCollection, {
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
