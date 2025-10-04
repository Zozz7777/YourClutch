use serde::{Deserialize, Serialize};
use anyhow::Result;
use reqwest::Client;

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResponse {
    pub success: bool,
    pub message: String,
    pub data: Option<AuthData>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthData {
    pub partner: PartnerInfo,
    pub access_token: String,
    pub refresh_token: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PartnerInfo {
    pub partner_id: String,
    pub business_name: String,
    pub partner_type: String,
    pub status: String,
    pub role: String,
}

pub struct AuthService {
    client: Client,
    base_url: String,
}

impl AuthService {
    pub fn new() -> Self {
        Self {
            client: Client::new(),
            base_url: "https://clutch-main-nk7x.onrender.com".to_string(),
        }
    }

    pub async fn validate_partner_id(&self, partner_id: &str) -> Result<AuthResponse> {
        log::info!("Validating partner ID: {}", partner_id);
        
        let url = format!("{}/api/v1/partners/validate-id", self.base_url);
        let request_body = serde_json::json!({
            "partnerId": partner_id
        });

        let response = self.client
            .post(&url)
            .json(&request_body)
            .send()
            .await?;

        if response.status().is_success() {
            let auth_response: AuthResponse = response.json().await?;
            log::info!("✅ Partner ID validated successfully");
            Ok(auth_response)
        } else {
            let error_text = response.text().await?;
            log::error!("❌ Partner ID validation failed: {}", error_text);
            Err(anyhow::anyhow!("Partner ID validation failed: {}", error_text))
        }
    }

    pub async fn login(&self, email: &str, password: &str) -> Result<AuthResponse> {
        log::info!("Login attempt for email: {}", email);
        
        let url = format!("{}/api/v1/partners/auth/partner-login", self.base_url);
        let request_body = serde_json::json!({
            "emailOrPhone": email,
            "password": password
        });

        let response = self.client
            .post(&url)
            .json(&request_body)
            .send()
            .await?;

        if response.status().is_success() {
            let auth_response: AuthResponse = response.json().await?;
            log::info!("✅ Login successful");
            Ok(auth_response)
        } else {
            let error_text = response.text().await?;
            log::error!("❌ Login failed: {}", error_text);
            Err(anyhow::anyhow!("Login failed: {}", error_text))
        }
    }
}
