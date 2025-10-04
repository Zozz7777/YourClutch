use serde::{Deserialize, Serialize};
use anyhow::Result;
use sqlx::{SqlitePool, Row};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct Product {
    pub id: i32,
    pub sku: String,
    pub name: String,
    pub price: f64,
    pub stock: i32,
    pub category: String,
    pub barcode: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Sale {
    pub id: i32,
    pub product_id: i32,
    pub quantity: i32,
    pub price: f64,
    pub total: f64,
    pub customer_name: String,
    pub timestamp: DateTime<Utc>,
}

pub struct Database {
    pool: SqlitePool,
}

impl Database {
    pub async fn new() -> Self {
        // Use a robust file database path
        let database_path = std::env::current_dir()
            .unwrap()
            .parent()
            .unwrap()
            .join("clutch_partners.db");
        
        // Ensure the directory exists
        if let Some(parent) = database_path.parent() {
            std::fs::create_dir_all(parent).unwrap_or_else(|_| {
                log::warn!("Could not create database directory");
            });
        }
        
        // Remove any existing empty or invalid file
        if database_path.exists() {
            if let Ok(metadata) = std::fs::metadata(&database_path) {
                if metadata.len() == 0 {
                    let _ = std::fs::remove_file(&database_path);
                }
            }
        }
        
        // Use an absolute path to avoid working directory issues
        let database_url = format!("sqlite:{}", database_path.display());
        log::info!("Connecting to database: {}", database_url);
        
        let pool = match SqlitePool::connect(&database_url).await {
            Ok(pool) => {
                log::info!("✅ Database connected successfully");
                pool
            }
            Err(e) => {
                log::error!("❌ Database connection failed: {}", e);
                log::error!("Database URL: {}", database_url);
                log::error!("Current directory: {:?}", std::env::current_dir());
                log::error!("Database path exists: {}", database_path.exists());
                log::error!("Database path: {}", database_path.display());
                
                // Try to create the database file manually
                if let Err(create_err) = std::fs::write(&database_path, "") {
                    log::error!("Failed to create database file: {}", create_err);
                }
                
                // Try connecting again
                match SqlitePool::connect(&database_url).await {
                    Ok(pool) => {
                        log::info!("✅ Database connected successfully on retry");
                        pool
                    }
                    Err(retry_err) => {
                        log::error!("❌ Database connection failed on retry: {}", retry_err);
                        panic!("Failed to connect to database: {}", retry_err);
                    }
                }
            }
        };
        
        // Create tables if they don't exist
        sqlx::query(
            "CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sku TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                stock INTEGER NOT NULL DEFAULT 0,
                category TEXT,
                barcode TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )"
        )
        .execute(&pool)
        .await
        .expect("Failed to create products table");

        sqlx::query(
            "CREATE TABLE IF NOT EXISTS sales (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                product_id INTEGER NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                total REAL NOT NULL,
                customer_name TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES products (id)
            )"
        )
        .execute(&pool)
        .await
        .expect("Failed to create sales table");
        
        Self { pool }
    }

    pub async fn get_products(&self) -> Result<Vec<Product>> {
        let rows = sqlx::query("SELECT * FROM products ORDER BY created_at DESC")
            .fetch_all(&self.pool)
            .await?;

        let products = rows.into_iter().map(|row| Product {
            id: row.get("id"),
            sku: row.get("sku"),
            name: row.get("name"),
            price: row.get("price"),
            stock: row.get("stock"),
            category: row.get("category"),
            barcode: row.get("barcode"),
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }).collect();

        Ok(products)
    }

    pub async fn add_product(
        &self,
        sku: &str,
        name: &str,
        price: f64,
        stock: i32,
        category: &str,
        barcode: &str,
    ) -> Result<Product> {
        let now = Utc::now();
        
        let result = sqlx::query(
            "INSERT INTO products (sku, name, price, stock, category, barcode, created_at, updated_at) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(sku)
        .bind(name)
        .bind(price)
        .bind(stock)
        .bind(category)
        .bind(barcode)
        .bind(now)
        .bind(now)
        .execute(&self.pool)
        .await?;
        
        let id = result.last_insert_rowid() as i32;

        Ok(Product {
            id,
            sku: sku.to_string(),
            name: name.to_string(),
            price,
            stock,
            category: category.to_string(),
            barcode: barcode.to_string(),
            created_at: now,
            updated_at: now,
        })
    }

    pub async fn process_sale(
        &self,
        product_id: i32,
        quantity: i32,
        customer_name: &str,
    ) -> Result<Sale> {
        // Get product details
        let product = sqlx::query(
            "SELECT * FROM products WHERE id = ?"
        )
        .bind(product_id)
        .fetch_one(&self.pool)
        .await?;

        let price: f64 = product.get("price");
        let total = price * quantity as f64;
        let now = Utc::now();

        // Insert sale record
        let sale_result = sqlx::query(
            "INSERT INTO sales (product_id, quantity, price, total, customer_name, timestamp) 
             VALUES (?, ?, ?, ?, ?, ?)"
        )
        .bind(product_id)
        .bind(quantity)
        .bind(price)
        .bind(total)
        .bind(customer_name)
        .bind(now)
        .execute(&self.pool)
        .await?;
        
        let sale_id = sale_result.last_insert_rowid() as i32;

        // Update stock
        sqlx::query(
            "UPDATE products SET stock = stock - ? WHERE id = ?"
        )
        .bind(quantity)
        .bind(product_id)
        .execute(&self.pool)
        .await?;

        Ok(Sale {
            id: sale_id,
            product_id,
            quantity,
            price,
            total,
            customer_name: customer_name.to_string(),
            timestamp: now,
        })
    }
}
