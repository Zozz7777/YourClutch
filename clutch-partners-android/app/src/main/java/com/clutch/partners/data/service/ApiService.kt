package com.clutch.partners.data.service

import com.clutch.partners.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ApiService @Inject constructor() {
    
    private val client = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .addInterceptor { chain ->
            val request = chain.request().newBuilder()
                .addHeader("Content-Type", "application/json")
                .addHeader("Accept", "application/json")
                .addHeader("User-Agent", "ClutchPartnersAndroid/1.0")
                .build()
            println("🌐 API: Making request to: ${request.url}")
            println("🌐 API: Request method: ${request.method}")
            println("🌐 API: Request headers: ${request.headers}")
            val response = chain.proceed(request)
            println("📡 API: Response code: ${response.code}")
            println("📡 API: Response headers: ${response.headers}")
            response
        }
        .build()
    
    private val baseUrl = "https://clutch-main-nk7x.onrender.com/api/v1" // Production backend URL
    
    // Test connectivity
    suspend fun testConnection(): Result<String> = withContext(Dispatchers.IO) {
        try {
            println("🌐 API: Testing connection to backend...")
            println("🌐 API: Base URL: $baseUrl")
            
            // Try a simple GET request first
            val testUrl = "https://httpbin.org/get"
            println("🌐 API: Testing with httpbin first: $testUrl")
            
            val testRequest = Request.Builder()
                .url(testUrl)
                .get()
                .build()
            
            val testResponse = client.newCall(testRequest).execute()
            println("📡 API: Httpbin test response code: ${testResponse.code}")
            
            if (testResponse.isSuccessful) {
                println("✅ API: Httpbin test successful - network is working")
            } else {
                println("❌ API: Httpbin test failed - network issue")
            }
            
            // Now try the actual backend
            val request = Request.Builder()
                .url("$baseUrl/partner-auth/test")
                .get()
                .build()
            
            println("🌐 API: Test request URL: ${request.url}")
            val response = client.newCall(request).execute()
            println("📡 API: Test response code: ${response.code}")
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                println("📡 API: Test response body: $responseBody")
                Result.success(responseBody ?: "Connection successful")
            } else {
                val errorBody = response.body?.string()
                println("❌ API: Test error response: $errorBody")
                Result.failure(Exception("Connection test failed: ${response.code} - $errorBody"))
            }
        } catch (e: Exception) {
            println("❌ API: Connection test error: ${e.message}")
            e.printStackTrace()
            Result.failure(e)
        }
    }
    
    // Authentication endpoints
    suspend fun signIn(email: String, password: String): Result<User> = withContext(Dispatchers.IO) {
        try {
            println("🔐 API: ===== SIGN IN START =====")
            println("🔐 API: Attempting sign in for email: $email")
            println("🔐 API: Base URL: $baseUrl")
            
            val json = JSONObject().apply {
                put("emailOrPhone", email)
                put("password", password)
                put("deviceId", "android_device_${System.currentTimeMillis()}")
            }
            
            val requestBody = json.toString().toRequestBody("application/json".toMediaType())
            val fullUrl = "$baseUrl/partner-auth/auth/partner-login"
            println("🔐 API: Full URL: $fullUrl")
            println("🔐 API: Request body: ${json.toString()}")
            
            val request = Request.Builder()
                .url(fullUrl)
                .post(requestBody)
                .addHeader("Content-Type", "application/json")
                .addHeader("Accept", "application/json")
                .build()
            
            println("🌐 API: Making request to: ${request.url}")
            println("🌐 API: Request headers: ${request.headers}")
            
            println("🌐 API: About to execute request...")
            val response = client.newCall(request).execute()
            println("📡 API: Response code: ${response.code}")
            println("📡 API: Response headers: ${response.headers}")
            println("📡 API: Response message: ${response.message}")
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                println("📡 API: Response body: $responseBody")
                if (responseBody != null) {
                    try {
                        val jsonResponse = JSONObject(responseBody)
                        val success = jsonResponse.optBoolean("success", false)
                        if (success) {
                            val data = jsonResponse.getJSONObject("data")
                            val partner = data.getJSONObject("partner")
                            val user = parsePartnerFromJson(partner)
                            Result.success(user)
                        } else {
                            val message = jsonResponse.optString("message", "Authentication failed")
                            Result.failure(Exception(message))
                        }
                    } catch (e: Exception) {
                        println("❌ API: Parsing error: ${e.message}")
                        Result.failure(Exception("Failed to parse user data: ${e.message}"))
                    }
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                val errorBody = response.body?.string() ?: "Unknown error"
                println("❌ API: Error response: $errorBody")
                Result.failure(Exception("Authentication failed: ${response.code} - $errorBody"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun signUp(
        partnerId: String,
        email: String,
        phone: String,
        password: String,
        businessName: String,
        ownerName: String,
        businessType: String,
        street: String,
        city: String,
        state: String,
        zipCode: String
    ): Result<User> = withContext(Dispatchers.IO) {
        try {
            println("🔐 API: Attempting sign up for email: $email")
            
            val json = JSONObject().apply {
                put("partnerId", partnerId)
                put("email", email)
                put("phone", phone)
                put("password", password)
                put("businessName", businessName)
                put("ownerName", ownerName)
                put("partnerType", mapBusinessTypeToBackend(businessType))
                put("businessAddress", JSONObject().apply {
                    put("street", street)
                    put("city", city)
                    put("state", state)
                    put("zipCode", zipCode)
                })
            }
            
            val requestBody = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$baseUrl/partner-auth/auth/signup")
                .post(requestBody)
                .build()
            
            println("🌐 API: Making request to: ${request.url}")
            val response = client.newCall(request).execute()
            println("📡 API: Response code: ${response.code}")
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                println("📡 API: Response body: $responseBody")
                if (responseBody != null) {
                    try {
                        val jsonResponse = JSONObject(responseBody)
                        val success = jsonResponse.optBoolean("success", false)
                        if (success) {
                            val data = jsonResponse.getJSONObject("data")
                            val partner = data.getJSONObject("partner")
                            val user = parsePartnerFromJson(partner)
                            Result.success(user)
                        } else {
                            val message = jsonResponse.optString("message", "Registration failed")
                            Result.failure(Exception(message))
                        }
                    } catch (e: Exception) {
                        println("❌ API: Parsing error: ${e.message}")
                        Result.failure(Exception("Failed to parse user data: ${e.message}"))
                    }
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                val errorBody = response.body?.string() ?: "Unknown error"
                println("❌ API: Error response: $errorBody")
                Result.failure(Exception("Registration failed: ${response.code} - $errorBody"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun requestToJoin(
        businessName: String,
        businessType: String,
        contactName: String,
        email: String,
        phone: String,
        address: String,
        description: String
    ): Result<User> = withContext(Dispatchers.IO) {
        try {
            println("🔐 API: Attempting request to join for email: $email")
            
            val json = JSONObject().apply {
                put("businessName", businessName)
                put("ownerName", contactName)
                put("phone", phone)
                put("email", email)
                put("address", address)
                put("partnerType", mapBusinessTypeToBackend(businessType))
                put("businessDescription", description)
            }
            
            val requestBody = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$baseUrl/partners/auth/request-to-join")
                .post(requestBody)
                .build()
            
            println("🌐 API: Making request to: ${request.url}")
            val response = client.newCall(request).execute()
            println("📡 API: Response code: ${response.code}")
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                println("📡 API: Response body: $responseBody")
                if (responseBody != null) {
                    try {
                        val jsonResponse = JSONObject(responseBody)
                        val success = jsonResponse.optBoolean("success", false)
                        if (success) {
                            val data = jsonResponse.getJSONObject("data")
                            val partner = data.getJSONObject("partner")
                            val user = parsePartnerFromJson(partner)
                            Result.success(user)
                        } else {
                            val message = jsonResponse.optString("message", "Request to join failed")
                            Result.failure(Exception(message))
                        }
                    } catch (e: Exception) {
                        println("❌ API: Parsing error: ${e.message}")
                        Result.failure(Exception("Failed to parse user data: ${e.message}"))
                    }
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                val errorBody = response.body?.string() ?: "Unknown error"
                println("❌ API: Error response: $errorBody")
                Result.failure(Exception("Request to join failed: ${response.code} - $errorBody"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // POS endpoints
    suspend fun createSale(sale: POSSale): Result<String> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("items", sale.items.map { item ->
                    JSONObject().apply {
                        put("sku", item.sku)
                        put("quantity", item.quantity)
                        put("price", item.price)
                    }
                })
                put("customerName", sale.customerName)
                put("customerPhone", sale.customerPhone)
                put("customerEmail", sale.customerEmail)
                put("paymentMethod", sale.paymentMethod)
                put("discount", sale.discount)
                put("notes", sale.notes)
            }
            
            val requestBody = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$baseUrl/pos/sales")
                .post(requestBody)
                .addHeader("Authorization", "Bearer ${getAuthToken()}")
                .build()
            
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    val responseJson = JSONObject(responseBody)
                    Result.success(responseJson.getString("saleId"))
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                Result.failure(Exception("Sale creation failed: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Inventory endpoints
    suspend fun getProducts(): Result<List<Product>> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$baseUrl/inventory")
                .addHeader("Authorization", "Bearer ${getAuthToken()}")
                .build()
            
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    try {
                        val jsonArray = org.json.JSONArray(responseBody)
                        val products = mutableListOf<Product>()
                        for (i in 0 until jsonArray.length()) {
                            val productJson = jsonArray.getJSONObject(i)
                            val product = parseProductFromJson(productJson)
                            products.add(product)
                        }
                        Result.success(products)
                    } catch (e: Exception) {
                        Result.failure(Exception("Failed to parse products: ${e.message}"))
                    }
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                Result.failure(Exception("Failed to fetch products: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun addProduct(product: Product): Result<String> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("sku", product.sku)
                put("name", product.name)
                put("description", product.description)
                put("category", product.category)
                put("price", product.price)
                put("cost", product.cost)
                put("stock", product.stock)
                put("minStock", product.minStock)
                put("maxStock", product.maxStock)
                put("barcode", product.barcode)
                put("imageUrl", product.imageUrl)
            }
            
            val requestBody = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$baseUrl/inventory")
                .post(requestBody)
                .addHeader("Authorization", "Bearer ${getAuthToken()}")
                .build()
            
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    val responseJson = JSONObject(responseBody)
                    Result.success(responseJson.getString("productId"))
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                Result.failure(Exception("Product creation failed: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Notifications endpoints
    suspend fun getNotifications(): Result<List<Notification>> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$baseUrl/notifications")
                .addHeader("Authorization", "Bearer ${getAuthToken()}")
                .build()
            
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    try {
                        val jsonArray = org.json.JSONArray(responseBody)
                        val notifications = mutableListOf<Notification>()
                        for (i in 0 until jsonArray.length()) {
                            val notificationJson = jsonArray.getJSONObject(i)
                            val notification = parseNotificationFromJson(notificationJson)
                            notifications.add(notification)
                        }
                        Result.success(notifications)
                    } catch (e: Exception) {
                        Result.failure(Exception("Failed to parse notifications: ${e.message}"))
                    }
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                Result.failure(Exception("Failed to fetch notifications: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Support endpoints
    suspend fun createSupportTicket(ticket: com.clutch.partners.data.model.SupportTicket): Result<String> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("subject", ticket.subject)
                put("description", ticket.description)
                put("priority", ticket.priority)
                put("category", ticket.category)
            }
            
            val requestBody = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$baseUrl/support/tickets")
                .post(requestBody)
                .addHeader("Authorization", "Bearer ${getAuthToken()}")
                .build()
            
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    val responseJson = JSONObject(responseBody)
                    Result.success(responseJson.getString("ticketId"))
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                Result.failure(Exception("Ticket creation failed: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Audit log endpoints
    suspend fun getAuditLogs(): Result<List<AuditLog>> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$baseUrl/audit-logs")
                .addHeader("Authorization", "Bearer ${getAuthToken()}")
                .build()
            
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    try {
                        val jsonArray = org.json.JSONArray(responseBody)
                        val auditLogs = mutableListOf<AuditLog>()
                        for (i in 0 until jsonArray.length()) {
                            val auditLogJson = jsonArray.getJSONObject(i)
                            val auditLog = parseAuditLogFromJson(auditLogJson)
                            auditLogs.add(auditLog)
                        }
                        Result.success(auditLogs)
                    } catch (e: Exception) {
                        Result.failure(Exception("Failed to parse audit logs: ${e.message}"))
                    }
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                Result.failure(Exception("Failed to fetch audit logs: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Data export endpoints
    suspend fun exportData(format: String, dataType: String): Result<String> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("format", format)
                put("dataType", dataType)
            }
            
            val requestBody = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$baseUrl/export")
                .post(requestBody)
                .addHeader("Authorization", "Bearer ${getAuthToken()}")
                .build()
            
            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    val responseJson = JSONObject(responseBody)
                    Result.success(responseJson.getString("downloadUrl"))
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                Result.failure(Exception("Export failed: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Helper functions
    private fun getAuthToken(): String {
        // TODO: Get from secure storage
        return "mock_token"
    }
    
    private fun mapPartnerTypeToBackend(partnerType: PartnerType): String {
        return when (partnerType) {
            PartnerType.REPAIR_CENTER -> "repair_center"
            PartnerType.AUTO_PARTS -> "auto_parts_shop"
            PartnerType.ACCESSORIES -> "accessories_shop"
            PartnerType.IMPORTER -> "importer_manufacturer"
            PartnerType.MANUFACTURER -> "importer_manufacturer"
            PartnerType.SERVICE_CENTER -> "service_center"
        }
    }
    
    private fun mapBusinessTypeToBackend(businessType: String): String {
        return when (businessType.uppercase()) {
            "REPAIR_CENTER" -> "repair_center"
            "AUTO_PARTS" -> "auto_parts_shop"
            "ACCESSORIES" -> "accessories_shop"
            "IMPORTER" -> "importer_manufacturer"
            "MANUFACTURER" -> "importer_manufacturer"
            "SERVICE_CENTER" -> "service_center"
            else -> "repair_center" // Default fallback
        }
    }
    
    private fun parsePartnerFromJson(json: JSONObject): User {
        return User(
            id = json.optString("_id", json.optString("id", "1")),
            email = json.optString("email", ""),
            phone = json.optString("phone", ""),
            partnerId = json.optString("partnerId", ""),
            businessName = json.optString("businessName", ""),
            businessType = try { PartnerType.valueOf(json.optString("businessType", "REPAIR_CENTER")) } catch (e: Exception) { PartnerType.REPAIR_CENTER },
            role = try { UserRole.valueOf(json.optString("role", "OWNER")) } catch (e: Exception) { UserRole.OWNER },
            permissions = try { UserRole.valueOf(json.optString("role", "OWNER")).permissions } catch (e: Exception) { UserRole.OWNER.permissions },
            isVerified = json.optBoolean("isVerified", true),
            createdAt = java.util.Date(),
            lastLoginAt = java.util.Date(),
            profileImage = json.optString("profileImage").takeIf { it.isNotEmpty() },
            address = json.optString("address", ""),
            taxId = json.optString("taxId", "")
        )
    }
    
    private fun parseUserFromJson(json: JSONObject): User {
        return User(
            id = json.getString("id"),
            email = json.getString("email"),
            phone = json.getString("phone"),
            partnerId = json.getString("partnerId"),
            businessName = json.getString("businessName"),
            businessType = PartnerType.valueOf(json.getString("businessType")),
            role = UserRole.valueOf(json.getString("role")),
            permissions = UserRole.valueOf(json.getString("role")).permissions,
            isVerified = json.getBoolean("isVerified"),
            createdAt = java.util.Date(),
            lastLoginAt = java.util.Date(),
            profileImage = json.optString("profileImage").takeIf { it.isNotEmpty() },
            address = json.getString("address"),
            taxId = json.getString("taxId")
        )
    }
    
    private fun parseProductFromJson(json: JSONObject): Product {
        return Product(
            id = json.getString("id"),
            sku = json.getString("sku"),
            name = json.getString("name"),
            description = json.getString("description"),
            category = json.getString("category"),
            price = json.getDouble("price"),
            cost = json.getDouble("cost"),
            stock = json.getInt("stock"),
            minStock = json.getInt("minStock"),
            maxStock = json.getInt("maxStock"),
            barcode = json.getString("barcode"),
            imageUrl = json.optString("imageUrl"),
            createdAt = System.currentTimeMillis(),
            updatedAt = System.currentTimeMillis()
        )
    }
    
    private fun parseNotificationFromJson(json: JSONObject): Notification {
        return Notification(
            id = json.getString("id"),
            title = json.getString("title"),
            message = json.getString("message"),
            type = NotificationType.valueOf(json.getString("type")),
            isRead = json.getBoolean("isRead"),
            createdAt = java.util.Date(),
            actionUrl = json.optString("actionUrl"),
            metadata = null
        )
    }
    
    private fun parseAuditLogFromJson(json: JSONObject): AuditLog {
        return AuditLog(
            id = json.getString("id"),
            userId = json.getString("userId"),
            userName = json.getString("userName"),
            action = json.getString("action"),
            resource = json.getString("resource"),
            details = json.getString("details"),
            timestamp = java.util.Date(),
            ipAddress = json.getString("ipAddress")
        )
    }
    
}
