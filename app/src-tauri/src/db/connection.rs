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

    pub fn insert(&self, query: &str, params: Params) -> std::result::Result<u64, Box<dyn Error>> {
        let mut conn = self.pool.get_conn()?;
        conn.exec_drop(query, params)?;
        let last_id = conn.last_insert_id();
        Ok(last_id as u64)
    }

    pub fn get<T>(&self, query: &str) -> std::result::Result<Vec<T>, Box<dyn Error>>
    where
        T: FromRow,
    {
        let mut conn = self.pool.get_conn()?;
        let result: Vec<T> = conn.query(query)?;
        Ok(result)
    }

    pub fn get_with_params<T>(&self, query: &str, params: Params) -> std::result::Result<Vec<T>, Box<dyn Error>>
    where
        T: FromRow,
    {
        let mut conn = self.pool.get_conn()?;
        let result: Vec<T> = conn.exec(query, params)?;
        Ok(result)
    }

    pub fn update(&self, query: &str, params: Params) -> std::result::Result<(), Box<dyn Error>> {
        let mut conn = self.pool.get_conn()?;
        conn.exec_drop(query, params)?;
        Ok(())
    }

    pub fn delete(&self, query: &str, params: Params) -> std::result::Result<(), Box<dyn Error>> {
        let mut conn = self.pool.get_conn()?;
        conn.exec_drop(query, params)?;
        Ok(())
    }
}