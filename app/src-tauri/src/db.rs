use mysql::*;
use mysql::prelude::*;
use std::error::Error;
use std::env;

pub struct DbConnection {
    pool: Pool,
}

impl DbConnection {
    pub fn new() -> std::result::Result<Self, Box<dyn Error>> {
        let host = env::var("MYSQL_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
        let port = env::var("MYSQL_PORT").unwrap_or_else(|_| "3306".to_string());
        let database = env::var("MYSQL_DATABASE").expect("MYSQL_DATABASE must be set");
        let user = env::var("MYSQL_USER").expect("MYSQL_USER must be set");
        let password = env::var("MYSQL_PASSWORD").expect("MYSQL_PASSWORD must be set");
        let url = format!("mysql://{}:{}@{}:{}/{}", user, password, host, port, database);
        let pool = Pool::new(url)?;
        Ok(DbConnection { pool })
    }

    pub fn insert_collection(&self, collection_name: &str) -> std::result::Result<(), Box<dyn Error>> {
        let mut conn = self.pool.get_conn()?;
        conn.exec_drop(
            "INSERT INTO collections (name) VALUES (:name)",
            params! {
                "name" => collection_name,
            }
        )?;
        Ok(())
    }
}

pub fn create_collection(collection_name: &str) -> std::result::Result<(), Box<dyn Error>> {
    let db = DbConnection::new()?;
    db.insert_collection(collection_name)?;
    println!("Collection '{}' created successfully", collection_name);
    Ok(())
}