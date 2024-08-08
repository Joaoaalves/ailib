use mysql::params;
use std::error::Error;
use crate::db::connection::DbConnection;

pub struct DocumentCollectionService {
    db: DbConnection,
}

impl DocumentCollectionService {
    pub fn new() -> std::result::Result<Self, Box<dyn Error>> {
        let db = DbConnection::new()?;
        Ok(DocumentCollectionService { db })
    }

    pub fn add_document_to_collection(&self, document_id: u64, collection_id: u64) -> std::result::Result<(), Box<dyn Error>> {
        let query = "INSERT INTO documentCollections (document_id, collection_id) VALUES (:document_id, :collection_id)";
        self.db.insert(query, params! {
            "document_id" => document_id,
            "collection_id" => collection_id
        })?;
        Ok(())
    }

    pub fn remove_document_from_collection(&self, document_id: u64, collection_id: u64) -> std::result::Result<(), Box<dyn Error>> {
        let query = "DELETE FROM documentCollections WHERE document_id = :document_id AND collection_id = :collection_id";
        self.db.delete(query, params! {
            "document_id" => document_id,
            "collection_id" => collection_id
        })?;
        Ok(())
    }
}
