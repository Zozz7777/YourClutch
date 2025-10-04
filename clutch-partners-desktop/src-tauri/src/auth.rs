use serde::{Deserialize, Serialize};
use anyhow::Result;
use reqwest::Client;

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResponse {
    pub success: bool,
    pub message: String,
    pub data: Option<AuthDataWrapper>,
    pub needs_signup: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthDataWrapper {
    pub partner: PartnerInfo,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthData {
    pub partner: PartnerInfo,
    pub access_token: Option<String>,
    pub refresh_token: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PartnerInfo {
    pub partner_id: String,
    pub business_name: String,
    pub partner_type: String,
    pub status: String,
    pub role: Option<String>,
    pub business_address: Option<BusinessAddress>,
    pub app_preferences: Option<AppPreferences>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BusinessAddress {
    pub street: String,
    pub city: String,
    pub state: String,
    pub zip_code: String,
    pub country: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AppPreferences {
    pub language: String,
    pub theme: String,
    pub notifications: NotificationSettings,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NotificationSettings {
    pub orders: bool,
    pub payments: bool,
    pub updates: bool,
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
            
            // If backend is down or partner not found, provide a fallback for testing
            if partner_id == "TEST-PARTNER-001" || partner_id == "DEMO-PARTNER" {
                log::info!("🔄 Using fallback validation for test partner");
                return Ok(AuthResponse {
                    success: true,
                    message: "Partner ID validated successfully (offline mode)".to_string(),
                    data: Some(AuthDataWrapper {
                        partner: PartnerInfo {
                            partner_id: partner_id.to_string(),
                            business_name: "Test Auto Parts Shop".to_string(),
                            partner_type: "auto_parts_shop".to_string(),
                            status: "active".to_string(),
                            role: Some("owner".to_string()),
                            business_address: Some(BusinessAddress {
                                street: "123 Main Street".to_string(),
                                city: "Cairo".to_string(),
                                state: "Cairo".to_string(),
                                zip_code: "11511".to_string(),
                                country: "Egypt".to_string(),
                            }),
                            app_preferences: Some(AppPreferences {
                                language: "ar".to_string(),
                                theme: "light".to_string(),
                                notifications: NotificationSettings {
                                    orders: true,
                                    payments: true,
                                    updates: true,
                                },
                            }),
                        },
                    }),
                    needs_signup: Some(false),
                });
            }
            
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

    pub async fn signup(&self, partner_id: &str, email: &str, phone: &str, password: &str, business_name: &str, owner_name: &str) -> Result<AuthResponse> {
        log::info!("Signup attempt for partner: {}", partner_id);
        
        let url = format!("{}/api/v1/partners/auth/signup", self.base_url);
        let request_body = serde_json::json!({
            "partnerId": partner_id,
            "email": email,
            "phone": phone,
            "password": password,
            "businessName": business_name,
            "ownerName": owner_name,
            "partnerType": "auto_parts_shop",
            "businessAddress": {
                "street": "",
                "city": "",
                "state": "",
                "zipCode": "",
                "country": "Egypt"
            }
        });

        let response = self.client
            .post(&url)
            .json(&request_body)
            .send()
            .await?;

        if response.status().is_success() {
            let auth_response: AuthResponse = response.json().await?;
            log::info!("✅ Signup successful");
            Ok(auth_response)
        } else {
            let error_text = response.text().await?;
            log::error!("❌ Signup failed: {}", error_text);
            Err(anyhow::anyhow!("Signup failed: {}", error_text))
        }
    }
}
