#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{command, Builder};
use reqwest;
use serde_json::json;
use pdf_extract::extract_text;
use std::env;
use qdrant_client::qdrant::{
    CreateCollectionBuilder, PointStruct, UpsertPointsBuilder, VectorParamsBuilder, Distance, Value as QdrantValue
};
use qdrant_client::{Qdrant, QdrantError, Payload};
use std::collections::HashMap;

fn split_text(text: &str, max_length: usize) -> Vec<String> {
    text.chars()
        .collect::<Vec<char>>()
        .chunks(max_length)
        .map(|chunk| chunk.iter().collect())
        .collect()
}

#[command]
async fn process_pdf(window: tauri::Window, pdf_path: String) -> Result<(), String> {
    let text = extract_text(&pdf_path).map_err(|e| e.to_string())?;
    
    let chunks = split_text(&text, 2500);
    let total_chunks = chunks.len();

    let client = reqwest::Client::new();
    let api_key = env::var("OPENAI_API_KEY").expect("OPENAI_API_KEY not set");
    

    let qdrant_client = Qdrant::from_url("http://localhost:6334").build().map_err(|e| e.to_string())?;
    let collection_name = "pdfs";
    
    let collections_response = qdrant_client.list_collections().await.map_err(|e| e.to_string())?;
    let existing_collections: Vec<String> = collections_response.collections.into_iter()
        .map(|c| c.name)
        .collect();
    

    if !existing_collections.contains(&collection_name.to_string()) {
        qdrant_client
            .create_collection(
                CreateCollectionBuilder::new(collection_name)
                    .vectors_config(VectorParamsBuilder::new(1536, Distance::Cosine))
            )
            .await
            .map_err(|e| e.to_string())?;
    }

    for (index, chunk) in chunks.into_iter().enumerate() {

        
        let response = client.post("https://api.openai.com/v1/embeddings")
            .header("Authorization", format!("Bearer {}", api_key))
            .json(&json!({
                "input": chunk,
                "model": "text-embedding-3-small"
            }))
            .send()
            .await
            .map_err(|e| e.to_string())?;
        
        let response_json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
        
        let embedding = response_json["data"][0]["embedding"]
            .as_array()
            .unwrap()
            .iter()
            .map(|v| v.as_f64().unwrap() as f32)
            .collect::<Vec<f32>>();


        let mut payload = HashMap::new();
        payload.insert("chunk_number".to_string(), QdrantValue::from((index + 1) as i64)); // Convertido para i64
        payload.insert("content".to_string(), QdrantValue::from(chunk.clone()));
        
        let point = PointStruct::new(
            index as u64,
            embedding.clone(),
            Payload::from(payload)
        );

        qdrant_client
            .upsert_points(UpsertPointsBuilder::new(collection_name, vec![point]))
            .await
            .map_err(|e| e.to_string())?;
        

        window.emit("embedding_progress", json!({
            "chunk": index + 1,
            "total": total_chunks,
            "embedding": embedding
        })).map_err(|e| e.to_string())?;
    }

    window.emit("embedding_complete", ()).map_err(|e| e.to_string())?;

    Ok(())
}

fn main() -> Result<(), QdrantError> {
    Builder::default()
        .invoke_handler(tauri::generate_handler![process_pdf])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}
