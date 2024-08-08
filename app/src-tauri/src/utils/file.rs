use std::fs;
use std::io;
use std::path::Path;

pub fn save_pdf_to_storage(pdf_path: &str, book_name: &str) -> io::Result<String> {
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

pub fn split_text(text: &str, max_length: usize) -> Vec<(String, usize)> {
    text.chars()
        .collect::<Vec<char>>()
        .chunks(max_length)
        .enumerate()
        .map(|(i, chunk)| (chunk.iter().collect(), i * max_length))
        .collect()
}
