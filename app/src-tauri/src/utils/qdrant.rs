use qdrant_client::qdrant::{
    CreateCollectionBuilder, PointStruct, UpsertPointsBuilder, VectorParamsBuilder, Distance, Value as QdrantValue
};
use qdrant_client::{Qdrant, QdrantError, Payload};
use std::collections::HashMap;

pub async fn ensure_collection_exists(
    qdrant_client: &Qdrant,
    collection_name: &str
) -> Result<(), QdrantError> {
    let collections_response = qdrant_client.list_collections().await?;
    let existing_collections: Vec<String> = collections_response.collections.into_iter()
        .map(|c| c.name)
        .collect();

    if !existing_collections.contains(&collection_name.to_string()) {
        qdrant_client
            .create_collection(
                CreateCollectionBuilder::new(collection_name)
                    .vectors_config(VectorParamsBuilder::new(1536, Distance::Cosine))
            )
            .await?;
    }

    Ok(())
}

pub async fn upsert_embedding(
    qdrant_client: &Qdrant,
    collection_name: &str,
    index: u64,
    embedding: Vec<f32>,
    chunk: String,
    book_name: String,
    offset: usize
) -> Result<(), QdrantError> {
    let mut payload = HashMap::new();
    payload.insert("chunk_number".to_string(), QdrantValue::from((index + 1) as i64));
    payload.insert("content".to_string(), QdrantValue::from(chunk.clone()));
    payload.insert("book_name".to_string(), QdrantValue::from(book_name.clone()));
    payload.insert("offset".to_string(), QdrantValue::from(offset as i64));

    let point = PointStruct::new(
        index,
        embedding,
        Payload::from(payload)
    );

    qdrant_client
        .upsert_points(UpsertPointsBuilder::new(collection_name.to_string(), vec![point]))
        .await?;

    Ok(())
}
