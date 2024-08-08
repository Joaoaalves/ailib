use reqwest;
use serde_json::json;
use std::error::Error;

pub async fn get_embeddings(api_key: &str, text_chunk: &str) -> Result<Vec<f32>, Box<dyn Error>> {
    let client = reqwest::Client::new();
    let response = client.post("https://api.openai.com/v1/embeddings")
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&json!({
            "input": text_chunk,
            "model": "text-embedding-3-small"
        }))
        .send()
        .await?;

    let response_json: serde_json::Value = response.json().await?;
    let embedding = response_json["data"][0]["embedding"]
        .as_array()
        .unwrap()
        .iter()
        .map(|v| v.as_f64().unwrap() as f32)
        .collect::<Vec<f32>>();

    Ok(embedding)
}

use std::fs;
use std::io::{self, Write};

const CONFIG_FILE_PATH: &str = "api_key.config";

pub fn save_api_key(api_key: &str) -> io::Result<()> {
    let mut file = fs::File::create(CONFIG_FILE_PATH)?;
    file.write_all(api_key.as_bytes())?;
    Ok(())
}

pub fn load_api_key() -> io::Result<String> {
    fs::read_to_string(CONFIG_FILE_PATH)
}
