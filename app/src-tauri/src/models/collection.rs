use mysql::prelude::FromRow;
use mysql::{Row, from_row};
use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Collection {
    pub id: u64,
    pub name: String,
}

impl FromRow for Collection {
    fn from_row(row: Row) -> Self {
        let (id, name) = from_row(row);
        Collection { id, name }
    }

    fn from_row_opt(row: Row) -> std::result::Result<Self, mysql::FromRowError> {
        let (id, name) = from_row(row);
        Ok(Collection { id, name })
    }
}
