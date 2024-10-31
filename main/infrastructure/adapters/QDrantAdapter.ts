import { QdrantClient } from "@qdrant/js-client-rest";
import { v4 as uuid } from "uuid";

import { SettingRepository } from "@infra/repositories/SettingRepository.";

export type Metadata = {
    collectionId: number;
    bookName?: string;
    page?: number;
    documentId: number;
    chunkId?: number;
};

export interface IResult {
    id: string | number;
    documentId: string;
    page: number;
    score: number;
    chunkId: number;
}

export interface IQDrantService {
    upsertEmbedding(embedding: number[], metadata: Metadata): Promise<void>;
    ensureCollectionExists?(): Promise<void>;
    deletePointsForDocumentId(documentId: number): Promise<void>;
    searchOnDocuments(
        embeddedMessage: number[],
        limit: number,
        filter?: Object,
    ): Promise<Object[]>;
}

export class QDrantAdapter implements IQDrantService {
    private client_url: string = "http://localhost:6333";
    private client = new QdrantClient({ url: this.client_url });

    private qdrantCollection: string;

    private largeCollectionName = "AILib-Large";
    private smallCollectionName = "AILib-Small";

    constructor(private settingRepository: SettingRepository) {}

    private async setQdrantCollection(): Promise<void> {
        const embeddingModel =
            await this.settingRepository.findById("embeddingModel");

        if (embeddingModel.value == "text-embedding-3-large") {
            this.qdrantCollection = this.largeCollectionName;
            return;
        }

        this.qdrantCollection = this.smallCollectionName;
    }

    async ensureCollectionExists(): Promise<void> {
        try {
            const smallCollection = await this.client.collectionExists(
                this.smallCollectionName,
            );
            if (!smallCollectionModel.exists) {
                await this.client.createCollection(this.smallCollectionName, {
                    vectors: {
                        size: 1536,
                        distance: "Cosine",
                    },
                });
            }

            const largeCollection = await this.client.collectionExists(
                this.largeCollectionName,
            );
            if (!largeCollectionModel.exists) {
                await this.client.createCollection(this.largeCollectionName, {
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

    async deletePointsForDocumentId(documentId: number): Promise<void> {
        if (!this.qdrantCollection) await this.setQdrantCollection();

        try {
            await this.client.delete(this.qdrantCollection, {
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
        } catch (error) {
            console.error(error);
            throw new Error(error);
        }
    }

    async upsertEmbedding(
        embedding: number[],
        metadata: Metadata,
    ): Promise<void> {
        if (!this.qdrantCollection) await this.setQdrantCollection();

        const point = {
            id: uuid(),
            vector: embedding,
            payload: metadata,
        };

        try {
            await this.client.upsert(this.qdrantCollection, {
                points: [point],
            });
        } catch (error) {
            console.error(`Error on QDrant Upserting: ${error}`);
        }
    }

    async searchOnDocuments(
        embeddedMessage: number[],
        limit: number = 5,
        filter?: Object,
    ): Promise<Object[]> {
        if (!this.qdrantCollection) await this.setQdrantCollection();

        try {
            const result = await this.client.search(this.qdrantCollection, {
                ...filter,
                with_vector: false,
                vector: embeddedMessage,
                with_payload: true,
                limit,
            });

            return result.map((res) => ({
                id: res.id,
                documentId: res.payload.documentId,
                page: res.payload?.page,
                score: res.score,
                chunkId: res.payload.chunkId,
            }));
        } catch (error) {
            console.error(`Error on QDrant Searching: ${error}`);
        }
    }
}
