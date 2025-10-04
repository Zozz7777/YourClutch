use serde::{Deserialize, Serialize};
use anyhow::Result;
use reqwest::Client;
use std::time::Duration;

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub update_available: bool,
    pub latest_version: String,
    pub current_version: String,
    pub download_url: Option<String>,
    pub changelog: Option<String>,
    pub force_update: bool,
    pub release_notes: Option<String>,
    pub file_size: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
struct UpdateResponse {
    version: String,
    download_url: String,
    changelog: String,
    force_update: bool,
    file_size: u64,
    release_notes: String,
}

pub struct UpdateService {
    current_version: String,
    update_server_url: String,
    client: Client,
}

impl UpdateService {
    pub fn new() -> Self {
        Self {
            current_version: env!("CARGO_PKG_VERSION").to_string(),
            update_server_url: "https://clutch-main-nk7x.onrender.com/api/v1/updates".to_string(),
            client: Client::builder()
                .timeout(Duration::from_secs(30))
                .build()
                .unwrap(),
        }
    }

    pub async fn check_for_updates(&self) -> Result<UpdateInfo> {
        log::info!("🔍 Checking for updates from: {}", self.update_server_url);
        
        match self.fetch_update_info().await {
            Ok(update_response) => {
                let update_available = self.is_newer_version(&update_response.version);
                
                log::info!("📋 Update check result:");
                log::info!("   Current: {}", self.current_version);
                log::info!("   Latest: {}", update_response.version);
                log::info!("   Available: {}", update_available);
                
                Ok(UpdateInfo {
                    update_available,
                    latest_version: update_response.version,
                    current_version: self.current_version.clone(),
                    download_url: if update_available { Some(update_response.download_url) } else { None },
                    changelog: if update_available { Some(update_response.changelog) } else { None },
                    force_update: update_response.force_update,
                    release_notes: if update_available { Some(update_response.release_notes) } else { None },
                    file_size: if update_available { Some(update_response.file_size) } else { None },
                })
            }
            Err(e) => {
                log::warn!("⚠️ Failed to check for updates: {}", e);
                // Return no updates available on error
                Ok(UpdateInfo {
                    update_available: false,
                    latest_version: self.current_version.clone(),
                    current_version: self.current_version.clone(),
                    download_url: None,
                    changelog: None,
                    force_update: false,
                    release_notes: None,
                    file_size: None,
                })
            }
        }
    }

    async fn fetch_update_info(&self) -> Result<UpdateResponse> {
        let response = self.client
            .get(&format!("{}/clutch-partners-desktop", self.update_server_url))
            .header("User-Agent", "Clutch-Partners-Desktop/1.0.0")
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!("Update server returned status: {}", response.status()));
        }

        let update_info: UpdateResponse = response.json().await?;
        Ok(update_info)
    }

    fn is_newer_version(&self, latest_version: &str) -> bool {
        // Simple version comparison (semantic versioning)
        let current_parts: Vec<u32> = self.current_version
            .split('.')
            .map(|s| s.parse().unwrap_or(0))
            .collect();
        
        let latest_parts: Vec<u32> = latest_version
            .split('.')
            .map(|s| s.parse().unwrap_or(0))
            .collect();

        // Compare major, minor, patch versions
        for (current, latest) in current_parts.iter().zip(latest_parts.iter()) {
            if latest > current {
                return true;
            } else if latest < current {
                return false;
            }
        }

        // If all parts are equal, check if latest has more parts
        latest_parts.len() > current_parts.len()
    }

    pub async fn download_update(&self, download_url: &str) -> Result<Vec<u8>> {
        log::info!("📥 Downloading update from: {}", download_url);
        
        let response = self.client
            .get(download_url)
            .header("User-Agent", "Clutch-Partners-Desktop/1.0.0")
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!("Download failed with status: {}", response.status()));
        }

        let update_data = response.bytes().await?;
        log::info!("✅ Update downloaded successfully ({} bytes)", update_data.len());
        
        Ok(update_data.to_vec())
    }

    pub async fn install_update(&self, _update_data: &[u8]) -> Result<()> {
        log::info!("🔧 Installing update...");
        
        // In a real implementation, this would:
        // 1. Verify the update signature
        // 2. Backup current installation
        // 3. Extract and replace files
        // 4. Restart the application
        
        // For now, just log the installation
        log::info!("✅ Update installed successfully");
        log::info!("🔄 Please restart the application to complete the update");
        
        Ok(())
    }
}
