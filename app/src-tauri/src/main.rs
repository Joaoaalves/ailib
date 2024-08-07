#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{command, Builder};
use reqwest;
use serde_json::json;
use pdf_extract::extract_text;
use qdrant_client::qdrant::{
    CreateCollectionBuilder, PointStruct, UpsertPointsBuilder, VectorParamsBuilder, Distance, Value as QdrantValue
};
use qdrant_client::{Qdrant, QdrantError, Payload};
use std::collections::HashMap;
use std::fs;
use std::io::{self, Write};
use std::path::Path;

const CONFIG_FILE_PATH: &str = "api_key.config";

fn save_api_key(api_key: &str) -> io::Result<()> {
    let mut file = fs::File::create(CONFIG_FILE_PATH)?;
    file.write_all(api_key.as_bytes())?;
    Ok(())
}

fn load_api_key() -> io::Result<String> {
    fs::read_to_string(CONFIG_FILE_PATH)
}

fn split_text(text: &str, max_length: usize) -> Vec<(String, usize)> {
    text.chars()
        .collect::<Vec<char>>()
        .chunks(max_length)
        .enumerate()
        .map(|(i, chunk)| (chunk.iter().collect(), i * max_length))
        .collect()
}

fn save_pdf_to_storage(pdf_path: &str, book_name: &str) -> io::Result<String> {
    let storage_dir = Path::new("storage");
    if !storage_dir.exists() {
        fs::create_dir(storage_dir)?;
    }

    let filename = Path::new(pdf_path)
        .file_name()
        .ok_or_else(|| io::Error::new(io::ErrorKind::Other, "Invalid PDF path"))?;
    let new_path = storage_dir.join(format!("{}_{}", book_name, filename.to_string_lossy()));
    fs::copy(pdf_path, &new_path)?;

    Ok(new_path.to_string_lossy().to_string())
}

#[command]
async fn set_api_key(api_key: String) -> Result<(), String> {
    save_api_key(&api_key).map_err(|e| e.to_string())
}

#[command]
async fn process_pdf(window: tauri::Window, pdf_path: String, book_name: String) -> Result<(), String> {
    let saved_pdf_path = save_pdf_to_storage(&pdf_path, &book_name)
        .map_err(|e| e.to_string())?;
    
    let text = extract_text(&saved_pdf_path).map_err(|e| e.to_string())?;

    let chunks = split_text(&text, 2500);
    let total_chunks = chunks.len();

    let client = reqwest::Client::new();
    let api_key = load_api_key().map_err(|e| e.to_string())?;

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

    for (index, (chunk, offset)) in chunks.into_iter().enumerate() {
        println!("Embedding {}° chunk", index);
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
        payload.insert("chunk_number".to_string(), QdrantValue::from((index + 1) as i64));
        payload.insert("content".to_string(), QdrantValue::from(chunk.clone()));
        payload.insert("book_name".to_string(), QdrantValue::from(book_name.clone()));
        payload.insert("offset".to_string(), QdrantValue::from(offset as i64));

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
        .invoke_handler(tauri::generate_handler![process_pdf, set_api_key])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}