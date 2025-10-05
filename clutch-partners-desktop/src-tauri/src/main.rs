// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod auth;
mod database;
mod sync;
mod pos;
mod inventory;
mod reports;
mod updater;

use tauri::State;
use std::sync::Arc;
use tokio::sync::Mutex;

// Application state
pub struct AppState {
    pub db: Arc<Mutex<database::Database>>,
    pub auth: Arc<Mutex<auth::AuthService>>,
    pub sync: Arc<Mutex<sync::SyncService>>,
    pub updater: Arc<Mutex<updater::UpdateService>>,
}

#[tauri::command]
async fn test_connection() -> Result<String, String> {
    log::info!("Testing backend connection...");
    
    // Test connection to backend
    match reqwest::get("https://clutch-main-nk7x.onrender.com/health").await {
        Ok(response) => {
            if response.status().is_success() {
                log::info!("✅ Backend connection successful!");
                Ok("✅ Backend connected successfully!".to_string())
            } else {
                log::error!("❌ Backend connection failed: {}", response.status());
                Err(format!("❌ Backend connection failed: {}", response.status()))
            }
        }
        Err(e) => {
            log::error!("❌ Backend connection error: {}", e);
            Err(format!("❌ Backend connection error: {}", e))
        }
    }
}

#[tauri::command]
async fn validate_partner_id(partner_id: String, state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Validating partner ID: {}", partner_id);
    
    let auth = state.auth.lock().await;
    match auth.validate_partner_id(&partner_id).await {
        Ok(response) => {
            log::info!("✅ Partner ID validated successfully!");
            Ok(serde_json::to_string(&response).unwrap_or_else(|_| "{}".to_string()))
        }
        Err(e) => {
            log::error!("❌ Partner ID validation failed: {}", e);
            Err(format!("❌ Partner ID validation failed: {}", e))
        }
    }
}

#[tauri::command]
async fn login(email: String, password: String, state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Login attempt for email: {}", email);
    
    let auth = state.auth.lock().await;
    match auth.login(&email, &password).await {
        Ok(response) => {
            log::info!("✅ Login successful!");
            Ok(serde_json::to_string(&response).unwrap_or_else(|_| "{}".to_string()))
        }
        Err(e) => {
            log::error!("❌ Login failed: {}", e);
            Err(format!("❌ Login failed: {}", e))
        }
    }
}

#[tauri::command]
async fn signup(
    partner_id: String,
    email: String,
    phone: String,
    password: String,
    business_name: String,
    owner_name: String,
    state: State<'_, AppState>
) -> Result<String, String> {
    log::info!("Signup attempt for partner: {}", partner_id);
    
    let auth = state.auth.lock().await;
    match auth.signup(&partner_id, &email, &phone, &password, &business_name, &owner_name).await {
        Ok(response) => {
            log::info!("✅ Signup successful!");
            Ok(serde_json::to_string(&response).unwrap_or_else(|_| "{}".to_string()))
        }
        Err(e) => {
            log::error!("❌ Signup failed: {}", e);
            Err(format!("❌ Signup failed: {}", e))
        }
    }
}

#[tauri::command]
async fn check_for_updates(state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Checking for updates...");
    
    let updater = state.updater.lock().await;
    match updater.check_for_updates().await {
        Ok(update_info) => {
            log::info!("✅ Update check completed");
            Ok(serde_json::to_string(&update_info).unwrap_or_else(|_| "{}".to_string()))
        }
        Err(e) => {
            log::error!("❌ Update check failed: {}", e);
            Err(format!("❌ Update check failed: {}", e))
        }
    }
}

#[tauri::command]
async fn get_sync_status(state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Getting sync status...");
    
    let sync = state.sync.lock().await;
    match sync.sync_data().await {
        Ok(status) => {
            log::info!("✅ Sync status retrieved");
            Ok(serde_json::to_string(&status).unwrap_or_else(|_| "{}".to_string()))
        }
        Err(e) => {
            log::error!("❌ Failed to get sync status: {}", e);
            Err(format!("❌ Failed to get sync status: {}", e))
        }
    }
}

#[tauri::command]
async fn start_websocket(state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Starting WebSocket connection...");
    
    let sync = state.sync.lock().await;
    match sync.start_websocket_connection().await {
        Ok(_) => {
            log::info!("✅ WebSocket started successfully");
            Ok("WebSocket connection started".to_string())
        }
        Err(e) => {
            log::error!("❌ Failed to start WebSocket: {}", e);
            Err(format!("❌ Failed to start WebSocket: {}", e))
        }
    }
}

#[tauri::command]
async fn stop_websocket(state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Stopping WebSocket connection...");
    
    let sync = state.sync.lock().await;
    match sync.stop_websocket_connection().await {
        Ok(_) => {
            log::info!("✅ WebSocket stopped successfully");
            Ok("WebSocket connection stopped".to_string())
        }
        Err(e) => {
            log::error!("❌ Failed to stop WebSocket: {}", e);
            Err(format!("❌ Failed to stop WebSocket: {}", e))
        }
    }
}

#[tauri::command]
async fn get_products(state: State<'_, AppState>) -> Result<String, String> {
    log::info!("Getting products...");
    
    let db = state.db.lock().await;
    match db.get_products().await {
        Ok(products) => {
            log::info!("✅ Products retrieved successfully");
            Ok(serde_json::to_string(&products).unwrap_or_else(|_| "[]".to_string()))
        }
        Err(e) => {
            log::error!("❌ Failed to get products: {}", e);
            Err(format!("❌ Failed to get products: {}", e))
        }
    }
}

#[tauri::command]
async fn add_product(
    sku: String,
    name: String,
    price: f64,
    stock: i32,
    category: String,
    barcode: String,
    state: State<'_, AppState>
) -> Result<String, String> {
    log::info!("Adding product: {} - {}", sku, name);
    
    let db = state.db.lock().await;
    match db.add_product(&sku, &name, price, stock, &category, &barcode).await {
        Ok(product) => {
            log::info!("✅ Product added successfully");
            Ok(serde_json::to_string(&product).unwrap_or_else(|_| "{}".to_string()))
        }
        Err(e) => {
            log::error!("❌ Failed to add product: {}", e);
            Err(format!("❌ Failed to add product: {}", e))
        }
    }
}

#[tauri::command]
async fn process_sale(
    product_id: i32,
    quantity: i32,
    customer_name: String,
    state: State<'_, AppState>
) -> Result<String, String> {
    log::info!("Processing sale: Product {} x {}", product_id, quantity);
    
    let db = state.db.lock().await;
    match db.process_sale(product_id, quantity, &customer_name).await {
        Ok(sale) => {
            log::info!("✅ Sale processed successfully");
            Ok(serde_json::to_string(&sale).unwrap_or_else(|_| "{}".to_string()))
        }
        Err(e) => {
            log::error!("❌ Failed to process sale: {}", e);
            Err(format!("❌ Failed to process sale: {}", e))
        }
    }
}

#[tokio::main]
async fn main() {
    // Initialize logger
    env_logger::Builder::from_default_env()
        .filter_level(log::LevelFilter::Info)
        .init();

    log::info!("🚀 Starting Clutch Partners System v1.0.0");

    // Initialize database
    let db = Arc::new(Mutex::new(database::Database::new().await));
    
    // Initialize services
    let auth = Arc::new(Mutex::new(auth::AuthService::new()));
    let sync = Arc::new(Mutex::new(sync::SyncService::new()));
    let updater = Arc::new(Mutex::new(updater::UpdateService::new()));

    // Create app state
    let app_state = AppState {
        db,
        auth,
        sync,
        updater,
    };

    tauri::Builder::default()
        .manage(app_state)
        .invoke_handler(tauri::generate_handler![
            test_connection,
            validate_partner_id,
            login,
            signup,
            check_for_updates,
            get_sync_status,
            start_websocket,
            stop_websocket,
            get_products,
            add_product,
            process_sale
        ])
        .setup(|_app| {
            log::info!("✅ Clutch Partners System initialized successfully");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
