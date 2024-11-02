import { IQDrantService, Metadata } from "@infra/adapters/QDrantAdapter";

export class QDrantService implements IQDrantService {
    constructor(private qdrantAdapter: IQDrantService) {}

    async upsertEmbedding(
        embedding: number[],
        metadata: Metadata,
    ): Promise<void> {
        await this.qdrantAdapter.ensureCollectionExists();

        return this.qdrantAdapter.upsertEmbedding(embedding, metadata);
    }

    async deletePointsForDocumentId(documentId: number): Promise<void> {
        await this.qdrantAdapter.ensureCollectionExists();
        return this.qdrantAdapter.deletePointsForDocumentId(documentId);
    }

    async searchOnDocuments(
        embeddedMessage: number[],
        limit: number,
        filter?: Object,
    ): Promise<Object[]> {
        await this.qdrantAdapter.ensureCollectionExists();
        return this.qdrantAdapter.searchOnDocuments(
            embeddedMessage,
            limit,
            filter,
        );
    }
}
