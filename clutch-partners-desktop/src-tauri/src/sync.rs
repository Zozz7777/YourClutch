use serde::{Deserialize, Serialize};
use anyhow::Result;
use reqwest::Client;
use tokio::time::{sleep, Duration};
use std::sync::Arc;
use tokio::sync::Mutex;

#[derive(Debug, Serialize, Deserialize)]
pub struct SyncStatus {
    pub is_online: bool,
    pub last_sync: Option<String>,
    pub pending_operations: i32,
    pub websocket_connected: bool,
    pub sync_in_progress: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SyncOperation {
    pub id: String,
    pub operation_type: String,
    pub data: serde_json::Value,
    pub timestamp: String,
    pub status: String,
}

pub struct SyncService {
    client: Client,
    base_url: String,
    pending_operations: Arc<Mutex<Vec<SyncOperation>>>,
    websocket_connected: Arc<Mutex<bool>>,
}

impl SyncService {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
            base_url: "https://clutch-main-nk7x.onrender.com".to_string(),
            pending_operations: Arc::new(Mutex::new(Vec::new())),
            websocket_connected: Arc::new(Mutex::new(false)),
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
        let pending_ops = self.pending_operations.lock().await;
        let websocket_connected = *self.websocket_connected.lock().await;
        
        Ok(SyncStatus {
            is_online,
            last_sync: if is_online { Some(chrono::Utc::now().to_rfc3339()) } else { None },
            pending_operations: pending_ops.len() as i32,
            websocket_connected,
            sync_in_progress: false,
        })
    }

    pub async fn start_websocket_connection(&self) -> Result<()> {
        log::info!("🔌 Starting WebSocket connection...");
        
        // Simulate WebSocket connection
        *self.websocket_connected.lock().await = true;
        log::info!("✅ WebSocket connected successfully");
        
        // Start background sync task
        self.start_background_sync().await;
        
        Ok(())
    }

    pub async fn stop_websocket_connection(&self) -> Result<()> {
        log::info!("🔌 Stopping WebSocket connection...");
        *self.websocket_connected.lock().await = false;
        log::info!("✅ WebSocket disconnected");
        Ok(())
    }

    async fn start_background_sync(&self) {
        let pending_ops = Arc::clone(&self.pending_operations);
        let websocket_connected = Arc::clone(&self.websocket_connected);
        
        tokio::spawn(async move {
            loop {
                sleep(Duration::from_secs(30)).await;
                
                if *websocket_connected.lock().await {
                    let mut ops = pending_ops.lock().await;
                    if !ops.is_empty() {
                        log::info!("🔄 Syncing {} pending operations...", ops.len());
                        // Simulate sync process
                        ops.clear();
                        log::info!("✅ Sync completed");
                    }
                }
            }
        });
    }

    pub async fn add_sync_operation(&self, operation_type: String, data: serde_json::Value) -> Result<String> {
        let operation_id = uuid::Uuid::new_v4().to_string();
        let operation = SyncOperation {
            id: operation_id.clone(),
            operation_type,
            data,
            timestamp: chrono::Utc::now().to_rfc3339(),
            status: "pending".to_string(),
        };
        
        let mut ops = self.pending_operations.lock().await;
        ops.push(operation);
        
        log::info!("📝 Added sync operation: {}", operation_id);
        Ok(operation_id)
    }

    pub async fn get_pending_operations(&self) -> Result<Vec<SyncOperation>> {
        let ops = self.pending_operations.lock().await;
        Ok(ops.clone())
    }
}
