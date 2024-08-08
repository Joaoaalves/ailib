use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct DocumentCollection{
    pub id: u64,
    pub document_id: u64,
    pub collection_id: u64,
}