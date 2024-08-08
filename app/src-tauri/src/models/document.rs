use mysql::prelude::FromRow;
use serde::{Serialize, Deserialize};
use mysql::{Row, from_row};

#[derive(Debug, Serialize, Deserialize)]
pub struct Document{
    pub id: u64,
    pub name: String,
    pub path: String,
}

impl FromRow for Document {
    fn from_row(row: Row) -> Self {
        let (id, name, path) = from_row(row);
        Document { id, name, path }
    }

    fn from_row_opt(row: Row) -> std::result::Result<Self, mysql::FromRowError> {
        let (id, name, path) = from_row(row);
        Ok(Document { id, name, path })
    }
}
