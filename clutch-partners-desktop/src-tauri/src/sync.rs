use serde::{Deserialize, Serialize};
use anyhow::Result;
use reqwest::Client;

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncStatus {
    pub is_online: bool,
    pub last_sync: Option<String>,
    pub pending_operations: i32,
}

pub struct SyncService {
    client: Client,
    base_url: String,
}

impl SyncService {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
            base_url: "https://clutch-main-nk7x.onrender.com".to_string(),
        }
    }

    pub async fn check_connection(&self) -> Result<bool> {
        match self.client.get(&format!("{}/health", self.base_url)).send().await {
            Ok(response) => Ok(response.status().is_success()),
            Err(_) => Ok(false),
        }
    }

    pub async fn sync_data(&self) -> Result<SyncStatus> {
        let is_online = self.check_connection().await?;
        
        Ok(SyncStatus {
            is_online,
            last_sync: if is_online { Some(chrono::Utc::now().to_rfc3339()) } else { None },
            pending_operations: 0, // TODO: Implement pending operations tracking
        })
    }
}
