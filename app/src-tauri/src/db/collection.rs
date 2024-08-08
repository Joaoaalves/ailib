use mysql::params;
use std::error::Error;
use crate::db::connection::DbConnection;
use crate::models::collection::Collection;

pub struct CollectionRepository {
    db: DbConnection,
}

impl CollectionRepository {
    pub fn new() -> std::result::Result<Self, Box<dyn Error>> {
        let db = DbConnection::new()?;
        Ok(CollectionRepository { db })
    }

    pub fn insert_collection(&self, collection_name: &str) -> std::result::Result<u64, Box<dyn Error>> {
        let query = "INSERT INTO collections (name) VALUES (:name)";
        let id =  self.db.insert(query, params! { "name" => collection_name })?;
        Ok(id)
    }

    pub fn get_collections(&self) -> std::result::Result<Vec<Collection>, Box<dyn Error>> {
        let query = "SELECT id, name FROM collections";
        let collections = self.db.get::<Collection>(query)?;
        Ok(collections)
    }

    pub fn update_collection(&self, id: u64, new_name: &str) -> std::result::Result<(), Box<dyn Error>> {
        let query = "UPDATE collections SET name = :name WHERE id = :id";
        self.db.update(query, params! { "id" => id, "name" => new_name })?;
        Ok(())
    }

    pub fn delete_collection(&self, id: u64) -> std::result::Result<(), Box<dyn Error>> {
        let query = "DELETE FROM collections WHERE id = :id";
        self.db.delete(query, params! { "id" => id })?;
        Ok(())
    }
}
