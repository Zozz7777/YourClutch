use serde::{Deserialize, Serialize};
use anyhow::Result;

#[derive(Debug, Serialize, Deserialize)]
pub struct InventoryItem {
    pub id: i32,
    pub sku: String,
    pub name: String,
    pub current_stock: i32,
    pub min_stock: i32,
    pub max_stock: i32,
    pub cost_price: f64,
    pub selling_price: f64,
}

pub struct InventoryService;

impl InventoryService {
    pub fn new() -> Self {
        Self
    }

    pub async fn get_low_stock_items(&self) -> Result<Vec<InventoryItem>> {
        // TODO: Implement low stock detection
        Ok(vec![])
    }
}
