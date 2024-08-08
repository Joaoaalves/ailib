#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{command, Builder};

mod db;
use db::collection::CollectionRepository;
use db::document::DocumentRepository;
use db::services::document_collection::DocumentCollectionService;

mod models;
use models::collection::Collection;
use models::document::Document;

mod utils;
use utils::openai::{get_embeddings, load_api_key, save_api_key};
use utils::file::{split_text, save_pdf_to_storage};
use utils::qdrant::{ensure_collection_exists, upsert_embedding};

#[command]
async fn set_api_key(api_key: String) -> Result<(), String> {
    save_api_key(&api_key).map_err(|e| e.to_string())
}

#[command]
async fn process_pdf(window: tauri::Window, pdf_path: String, book_name: String, collection: u64) -> Result<(), String> {
    let saved_pdf_path = save_pdf_to_storage(&pdf_path, &book_name)
        .map_err(|e| e.to_string())?;
    
    let text = pdf_extract::extract_text(&saved_pdf_path).map_err(|e| e.to_string())?;

    // Split text in chunks
    let chunks = split_text(&text, 2500);
    let total_chunks = chunks.len();

    // Get Api Key
    let api_key = load_api_key().map_err(|e| e.to_string())?;

    // Get Qdrant Client
    let qdrant_client = qdrant_client::Qdrant::from_url("http://localhost:6334")
        .build()
        .map_err(|e| e.to_string())?;

    // Ensure the collection exists
    ensure_collection_exists(&qdrant_client, &collection.to_string()).await.map_err(|e| e.to_string())?;

    // Save the document on mysql
    let document_repo = DocumentRepository::new().map_err(|e| e.to_string())?;
    let document_id = document_repo.insert_document(&book_name, &saved_pdf_path).map_err(|e| e.to_string())?;

    // Make the embedding on openai and insert into QDrant
    for (index, (chunk, offset)) in chunks.into_iter().enumerate() {
        println!("Embedding {}° chunk", index);
        let embedding = get_embeddings(&api_key, &chunk).await.map_err(|e| e.to_string())?;
    
        // Clone the embedding for the Qdrant upsert and for progress emission
        let embedding_clone = embedding.clone();
    
        // Insert embedding into Qdrant
        upsert_embedding(
            &qdrant_client,
            &collection.to_string(),
            index as u64,
            embedding.clone(),
            chunk,
            book_name.clone(),
            offset
        ).await.map_err(|e| e.to_string())?;
    
        // Add document to collection
        let doc_col_service = DocumentCollectionService::new().map_err(|e| e.to_string())?;
        doc_col_service.add_document_to_collection(document_id, collection)
            .map_err(|e| e.to_string())?;
    
        window.emit("embedding_progress", serde_json::json!({
            "chunk": index + 1,
            "total": total_chunks,
            "embedding": embedding_clone // Use the cloned value here
        })).map_err(|e| e.to_string())?;
    }

    window.emit("embedding_complete", ()).map_err(|e| e.to_string())?;

    Ok(())
}

#[command]
async fn create_collection(collection_name: String) -> Result<(), String> {
    let repo = match CollectionRepository::new() {
        Ok(repo) => repo,
        Err(e) => return Err(e.to_string()),
    };

    repo.insert_collection(&collection_name).map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
async fn get_collections() -> Result<Vec<Collection>, String> {
    let repo = match CollectionRepository::new() {
        Ok(repo) => repo,
        Err(e) => return Err(e.to_string()),
    };

    let collections = repo.get_collections().map_err(|e| e.to_string())?;
    Ok(collections)
}

#[command]
async fn get_documents() -> Result<Vec<Document>, String>{
    let repo = match DocumentRepository::new(){
        Ok(repo) => repo,
        Err(e) => return Err(e.to_string()),
    };

    let documents = repo.get_documents().map_err(|e| e.to_string())?;
    Ok(documents)
}

fn main() -> Result<(), String> {
    Builder::default()
        .invoke_handler(tauri::generate_handler![process_pdf, set_api_key, get_collections, create_collection, get_documents])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    Ok(())
}