use mysql::params;
use std::error::Error;
use crate::db::connection::DbConnection;
use crate::models::document::Document;

pub struct DocumentRepository {
    db: DbConnection,
}

impl DocumentRepository {
    pub fn new() -> std::result::Result<Self, Box<dyn Error>> {
        let db = DbConnection::new()?;
        Ok(DocumentRepository { db })
    }

    pub fn insert_document(&self, name: &str, path: &str) -> std::result::Result<u64, Box<dyn Error>> {
        let query = "INSERT INTO documents (name, path) VALUES (:name, :path)";
        let id = self.db.insert(query, params! {
            "name" => name,
            "path" => path
        })?;
        Ok(id)
    }

    pub fn get_documents(&self) -> std::result::Result<Vec<Document>, Box<dyn Error>> {
        let query = "SELECT id, name, path FROM documents";
        let documents = self.db.get::<Document>(query)?;
        Ok(documents)
    }

    pub fn update_document(&self, id: u64, new_name: &str, new_path: &str) -> std::result::Result<(), Box<dyn Error>> {
        let query = "UPDATE documents SET name = :name, path = :path WHERE id = :id";
        self.db.update(query, params! {
            "id" => id,
            "name" => new_name,
            "path" => new_path
        })?;
        Ok(())
    }

    pub fn delete_document(&self, id: u64) -> std::result::Result<(), Box<dyn Error>> {
        let query = "DELETE FROM documents WHERE id = :id";
        self.db.delete(query, params! {
            "id" => id
        })?;
        Ok(())
    }

    pub fn get_document_by_id(&self, id: u64) -> std::result::Result<Document, Box<dyn Error>> {
        let query = "SELECT id, name, path FROM documents WHERE id = :id";
        let documents = self.db.get_with_params::<Document>(query, params! { "id" => id })?;
        documents.into_iter().next().ok_or_else(|| "Document not found".into())
    }
}
