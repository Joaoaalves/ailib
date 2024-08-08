use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Collection {
    pub id: u64,
    pub name: String,
}