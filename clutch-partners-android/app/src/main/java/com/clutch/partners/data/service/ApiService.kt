package com.clutch.partners.data.service

import com.clutch.partners.data.model.*
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
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
            println("🌐 API: About to execute backend test...")
            val startTime = System.currentTimeMillis()
            val response = client.newCall(request).execute()
            val endTime = System.currentTimeMillis()
            println("📡 API: Backend test completed in ${endTime - startTime}ms")
            println("📡 API: Test response code: ${response.code}")
            println("📡 API: Test response message: ${response.message}")
            println("📡 API: Test response headers: ${response.headers}")
            
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
            println("❌ API: Error type: ${e.javaClass.simpleName}")
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
            println("🌐 API: Request method: ${request.method}")
            
            println("🌐 API: About to execute request...")
            val startTime = System.currentTimeMillis()
            val response = client.newCall(request).execute()
            val endTime = System.currentTimeMillis()
            println("📡 API: Request completed in ${endTime - startTime}ms")
            println("📡 API: Response code: ${response.code}")
            println("📡 API: Response headers: ${response.headers}")
            println("📡 API: Response message: ${response.message}")
            println("📡 API: Response successful: ${response.isSuccessful}")
            
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
            println("❌ API: Sign in error: ${e.message}")
            println("❌ API: Error type: ${e.javaClass.simpleName}")
            e.printStackTrace()
            Result.failure(e)
        }
    }
    
    suspend fun signUp(
        partnerId: String,
        email: String,
        phone: String,
        password: String
    ): Result<User> = withContext(Dispatchers.IO) {
        try {
            println("🔐 API: Attempting sign up for email: $email, phone: $phone")
            
            val json = JSONObject().apply {
                put("partnerId", partnerId)
                put("password", password)
                // Only include email or phone, not both - avoid sending undefined/null
                if (email.isNotEmpty() && email != "undefined" && email != "null") {
                    put("email", email)
                }
                if (phone.isNotEmpty() && phone != "undefined" && phone != "null") {
                    put("phone", phone)
                }
            }
            
            println("📤 API: Sending signup request with JSON: ${json.toString()}")
            
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
                            val status = data.optString("status", "")
                            
                            if (status == "pending_approval") {
                                // Handle approval flow
                                val message = jsonResponse.optString("message", "Registration request submitted for approval")
                                Result.failure(Exception("APPROVAL_PENDING: $message"))
                            } else {
                                // Normal signup success
                                val partner = data.getJSONObject("partner")
                                val user = parsePartnerFromJson(partner)
                                Result.success(user)
                            }
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
    ): Result<Pair<Boolean, Boolean>> = withContext(Dispatchers.IO) { // success, isDuplicate
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
                            // Check if this is a duplicate request by looking at the message
                            val message = jsonResponse.optString("message", "")
                            val isDuplicate = message.contains("already being processed", ignoreCase = true) || 
                                             message.contains("already exists", ignoreCase = true)
                            
                            // Request to join successful - return success and duplicate status
                            Result.success(Pair(true, isDuplicate))
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
        return when (businessType.lowercase()) {
            "ورشة إصلاح", "repair shop" -> "repair_center"
            "وكالة سيارات", "car dealership" -> "service_center"
            "متجر قطع غيار", "parts store" -> "auto_parts_shop"
            "خدمات صيانة", "maintenance services" -> "service_center"
            "أخرى", "other" -> "repair_center"
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

    // ============================================================================
    // APPROVAL MANAGEMENT API METHODS
    // ============================================================================

    suspend fun getPendingApprovals(token: String): List<ApprovalRequest> = withContext(Dispatchers.IO) {
        try {
            println("🌐 API: Getting pending approvals...")
            
            val request = Request.Builder()
                .url("$baseUrl/partner-approvals/pending")
                .get()
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            println("📡 API: Pending approvals response code: ${response.code}")

            if (response.isSuccessful) {
                val responseBody = response.body?.string() ?: ""
                println("📡 API: Pending approvals response: $responseBody")
                
                val json = JSONObject(responseBody)
                if (json.getBoolean("success")) {
                    val dataArray = json.getJSONArray("data")
                    val approvals = mutableListOf<ApprovalRequest>()
                    
                    for (i in 0 until dataArray.length()) {
                        val approvalJson = dataArray.getJSONObject(i)
                        approvals.add(parseApprovalRequestFromJson(approvalJson))
                    }
                    
                    println("✅ API: Successfully loaded ${approvals.size} pending approvals")
                    return@withContext approvals
                } else {
                    throw Exception("Failed to load pending approvals: ${json.getString("message")}")
                }
            } else {
                throw Exception("Failed to load pending approvals: HTTP ${response.code}")
            }
        } catch (e: Exception) {
            println("❌ API: Error getting pending approvals: ${e.message}")
            throw e
        }
    }

    suspend fun getMyApprovalRequests(token: String): List<ApprovalRequest> = withContext(Dispatchers.IO) {
        try {
            println("🌐 API: Getting my approval requests...")
            
            val request = Request.Builder()
                .url("$baseUrl/partner-approvals/my-requests")
                .get()
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            println("📡 API: My requests response code: ${response.code}")

            if (response.isSuccessful) {
                val responseBody = response.body?.string() ?: ""
                println("📡 API: My requests response: $responseBody")
                
                val json = JSONObject(responseBody)
                if (json.getBoolean("success")) {
                    val dataArray = json.getJSONArray("data")
                    val requests = mutableListOf<ApprovalRequest>()
                    
                    for (i in 0 until dataArray.length()) {
                        val requestJson = dataArray.getJSONObject(i)
                        requests.add(parseApprovalRequestFromJson(requestJson))
                    }
                    
                    println("✅ API: Successfully loaded ${requests.size} my approval requests")
                    return@withContext requests
                } else {
                    throw Exception("Failed to load my approval requests: ${json.getString("message")}")
                }
            } else {
                throw Exception("Failed to load my approval requests: HTTP ${response.code}")
            }
        } catch (e: Exception) {
            println("❌ API: Error getting my approval requests: ${e.message}")
            throw e
        }
    }

    suspend fun approveRequest(approvalId: String, token: String): Unit = withContext(Dispatchers.IO) {
        try {
            println("🌐 API: Approving request $approvalId...")
            
            val requestBody = JSONObject().apply {
                put("approvedRole", "partner_employee") // Default role, can be customized
            }.toString().toRequestBody("application/json".toMediaType())
            
            val request = Request.Builder()
                .url("$baseUrl/partner-approvals/$approvalId/approve")
                .post(requestBody)
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            println("📡 API: Approve response code: ${response.code}")

            if (response.isSuccessful) {
                val responseBody = response.body?.string() ?: ""
                println("📡 API: Approve response: $responseBody")
                
                val json = JSONObject(responseBody)
                if (json.getBoolean("success")) {
                    println("✅ API: Successfully approved request")
                } else {
                    throw Exception("Failed to approve request: ${json.getString("message")}")
                }
            } else {
                throw Exception("Failed to approve request: HTTP ${response.code}")
            }
        } catch (e: Exception) {
            println("❌ API: Error approving request: ${e.message}")
            throw e
        }
    }

    suspend fun rejectRequest(approvalId: String, reason: String, token: String): Unit = withContext(Dispatchers.IO) {
        try {
            println("🌐 API: Rejecting request $approvalId with reason: $reason...")
            
            val requestBody = JSONObject().apply {
                put("rejectionReason", reason)
            }.toString().toRequestBody("application/json".toMediaType())
            
            val request = Request.Builder()
                .url("$baseUrl/partner-approvals/$approvalId/reject")
                .post(requestBody)
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            println("📡 API: Reject response code: ${response.code}")

            if (response.isSuccessful) {
                val responseBody = response.body?.string() ?: ""
                println("📡 API: Reject response: $responseBody")
                
                val json = JSONObject(responseBody)
                if (json.getBoolean("success")) {
                    println("✅ API: Successfully rejected request")
                } else {
                    throw Exception("Failed to reject request: ${json.getString("message")}")
                }
            } else {
                throw Exception("Failed to reject request: HTTP ${response.code}")
            }
        } catch (e: Exception) {
            println("❌ API: Error rejecting request: ${e.message}")
            throw e
        }
    }

    suspend fun getApprovalRequestDetails(approvalId: String, token: String): ApprovalRequest = withContext(Dispatchers.IO) {
        try {
            println("🌐 API: Getting approval request details for $approvalId...")
            
            val request = Request.Builder()
                .url("$baseUrl/partner-approvals/$approvalId")
                .get()
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            println("📡 API: Approval details response code: ${response.code}")

            if (response.isSuccessful) {
                val responseBody = response.body?.string() ?: ""
                println("📡 API: Approval details response: $responseBody")
                
                val json = JSONObject(responseBody)
                if (json.getBoolean("success")) {
                    val data = json.getJSONObject("data")
                    println("✅ API: Successfully loaded approval request details")
                    return@withContext parseApprovalRequestFromJson(data)
                } else {
                    throw Exception("Failed to load approval request details: ${json.getString("message")}")
                }
            } else {
                throw Exception("Failed to load approval request details: HTTP ${response.code}")
            }
        } catch (e: Exception) {
            println("❌ API: Error getting approval request details: ${e.message}")
            throw e
        }
    }

    private fun parseApprovalRequestFromJson(json: JSONObject): ApprovalRequest {
        return ApprovalRequest(
            id = json.getString("_id"),
            partnerId = json.getString("partnerId"),
            requesterEmail = json.getString("requesterEmail"),
            requesterPhone = json.getString("requesterPhone"),
            requesterName = json.getString("requesterName"),
            requestedRole = json.getString("requestedRole"),
            requestedPermissions = json.optJSONArray("requestedPermissions")?.let { array ->
                (0 until array.length()).map { array.getString(it) }
            } ?: emptyList(),
            status = json.getString("status"),
            approvedBy = json.optString("approvedBy").takeIf { it.isNotEmpty() },
            approvedAt = json.optString("approvedAt").takeIf { it.isNotEmpty() },
            rejectionReason = json.optString("rejectionReason").takeIf { it.isNotEmpty() },
            approvedRole = json.optString("approvedRole").takeIf { it.isNotEmpty() },
            approvedPermissions = json.optJSONArray("approvedPermissions")?.let { array ->
                (0 until array.length()).map { array.getString(it) }
            } ?: emptyList(),
            businessJustification = json.optString("businessJustification"),
            notes = json.optString("notes"),
            createdAt = json.getString("createdAt"),
            updatedAt = json.getString("updatedAt"),
            expiresAt = json.getString("expiresAt")
        )
    }

    // ============================================================================
    // APPOINTMENTS API METHODS
    // ============================================================================

    suspend fun getAppointments(
        status: String? = null,
        date: String? = null,
        page: Int = 1,
        limit: Int = 20,
        token: String
    ): Result<Pair<List<Appointment>, Pagination>> = withContext(Dispatchers.IO) {
        try {
            val urlBuilder = "$baseUrl/partners/appointments".toHttpUrl().newBuilder()
                .addQueryParameter("page", page.toString())
                .addQueryParameter("limit", limit.toString())
            
            status?.let { urlBuilder.addQueryParameter("status", it) }
            date?.let { urlBuilder.addQueryParameter("date", it) }
            
            val request = Request.Builder()
                .url(urlBuilder.build())
                .get()
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    val json = JSONObject(responseBody)
                    if (json.getBoolean("success")) {
                        val data = json.getJSONObject("data")
                        val appointmentsArray = data.getJSONArray("appointments")
                        val paginationJson = data.getJSONObject("pagination")
                        
                        val appointments = mutableListOf<Appointment>()
                        for (i in 0 until appointmentsArray.length()) {
                            val appointmentJson = appointmentsArray.getJSONObject(i)
                            appointments.add(parseAppointmentFromJson(appointmentJson))
                        }
                        
                        val pagination = Pagination(
                            page = paginationJson.getInt("page"),
                            limit = paginationJson.getInt("limit"),
                            total = paginationJson.getInt("total"),
                            pages = paginationJson.getInt("pages")
                        )
                        
                        Result.success(Pair(appointments, pagination))
                    } else {
                        Result.failure(Exception("Failed to load appointments: ${json.getString("message")}"))
                    }
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                Result.failure(Exception("Failed to load appointments: HTTP ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getAppointmentDetails(appointmentId: String, token: String): Result<Appointment> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$baseUrl/partners/appointments/$appointmentId")
                .get()
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    val json = JSONObject(responseBody)
                    if (json.getBoolean("success")) {
                        val data = json.getJSONObject("data")
                        Result.success(parseAppointmentFromJson(data))
                    } else {
                        Result.failure(Exception("Failed to load appointment: ${json.getString("message")}"))
                    }
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                Result.failure(Exception("Failed to load appointment: HTTP ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createAppointment(appointmentRequest: AppointmentRequest, token: String): Result<Appointment> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("customerName", appointmentRequest.customerName)
                put("customerPhone", appointmentRequest.customerPhone)
                put("customerEmail", appointmentRequest.customerEmail)
                put("serviceName", appointmentRequest.serviceName)
                put("description", appointmentRequest.description)
                put("scheduledDate", appointmentRequest.scheduledDate.toISOString())
                put("estimatedTime", appointmentRequest.estimatedTime)
                put("vehicleMake", appointmentRequest.vehicleMake)
                put("vehicleModel", appointmentRequest.vehicleModel)
                put("vehicleYear", appointmentRequest.vehicleYear)
                put("vehiclePlate", appointmentRequest.vehiclePlate)
                put("priority", appointmentRequest.priority.name.lowercase())
            }
            
            val requestBody = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$baseUrl/partners/appointments")
                .post(requestBody)
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    val jsonResponse = JSONObject(responseBody)
                    if (jsonResponse.getBoolean("success")) {
                        val data = jsonResponse.getJSONObject("data")
                        Result.success(parseAppointmentFromJson(data))
                    } else {
                        Result.failure(Exception("Failed to create appointment: ${jsonResponse.getString("message")}"))
                    }
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                Result.failure(Exception("Failed to create appointment: HTTP ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateAppointmentStatus(
        appointmentId: String,
        status: AppointmentStatus,
        notes: String?,
        estimatedTime: String?,
        token: String
    ): Result<Appointment> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("status", status.name.lowercase())
                notes?.let { put("notes", it) }
                estimatedTime?.let { put("estimatedTime", it) }
            }
            
            val requestBody = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$baseUrl/partners/appointments/$appointmentId/status")
                .patch(requestBody)
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    val jsonResponse = JSONObject(responseBody)
                    if (jsonResponse.getBoolean("success")) {
                        val data = jsonResponse.getJSONObject("data")
                        Result.success(parseAppointmentFromJson(data))
                    } else {
                        Result.failure(Exception("Failed to update appointment: ${jsonResponse.getString("message")}"))
                    }
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                Result.failure(Exception("Failed to update appointment: HTTP ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ============================================================================
    // QUOTATIONS API METHODS
    // ============================================================================

    suspend fun getQuotations(
        status: String? = null,
        page: Int = 1,
        limit: Int = 20,
        token: String
    ): Result<QuotationResponse> = withContext(Dispatchers.IO) {
        try {
            val urlBuilder = "$baseUrl/partners/quotations".toHttpUrl().newBuilder()
                .addQueryParameter("page", page.toString())
                .addQueryParameter("limit", limit.toString())
            
            status?.let { urlBuilder.addQueryParameter("status", it) }
            
            val request = Request.Builder()
                .url(urlBuilder.build())
                .get()
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    val json = JSONObject(responseBody)
                    if (json.getBoolean("success")) {
                        val data = json.getJSONObject("data")
                        val quotationsArray = data.getJSONArray("quotations")
                        val paginationJson = data.getJSONObject("pagination")
                        
                        val quotations = mutableListOf<Quotation>()
                        for (i in 0 until quotationsArray.length()) {
                            val quotationJson = quotationsArray.getJSONObject(i)
                            quotations.add(parseQuotationFromJson(quotationJson))
                        }
                        
                        val pagination = Pagination(
                            page = paginationJson.getInt("page"),
                            limit = paginationJson.getInt("limit"),
                            total = paginationJson.getInt("total"),
                            pages = paginationJson.getInt("pages")
                        )
                        
                        Result.success(QuotationResponse(quotations, pagination))
                    } else {
                        Result.failure(Exception("Failed to load quotations: ${json.getString("message")}"))
                    }
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                Result.failure(Exception("Failed to load quotations: HTTP ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun createQuotation(quotationRequest: QuotationRequest, token: String): Result<Quotation> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("customerName", quotationRequest.customerName)
                put("customerPhone", quotationRequest.customerPhone)
                put("customerEmail", quotationRequest.customerEmail)
                put("serviceName", quotationRequest.serviceName)
                put("description", quotationRequest.description)
                put("total", quotationRequest.total)
                put("validUntil", quotationRequest.validUntil?.toISOString())
                put("items", quotationRequest.items.map { item ->
                    JSONObject().apply {
                        put("name", item.name)
                        put("description", item.description)
                        put("quantity", item.quantity)
                        put("unitPrice", item.unitPrice)
                        put("total", item.total)
                    }
                })
            }
            
            val requestBody = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$baseUrl/partners/quotations")
                .post(requestBody)
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    val jsonResponse = JSONObject(responseBody)
                    if (jsonResponse.getBoolean("success")) {
                        val data = jsonResponse.getJSONObject("data")
                        Result.success(parseQuotationFromJson(data))
                    } else {
                        Result.failure(Exception("Failed to create quotation: ${jsonResponse.getString("message")}"))
                    }
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                Result.failure(Exception("Failed to create quotation: HTTP ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ============================================================================
    // INVENTORY API METHODS
    // ============================================================================

    suspend fun getInventory(
        category: String? = null,
        status: String? = null,
        search: String? = null,
        page: Int = 1,
        limit: Int = 20,
        token: String
    ): Result<InventoryResponse> = withContext(Dispatchers.IO) {
        try {
            val urlBuilder = "$baseUrl/partners/inventory".toHttpUrl().newBuilder()
                .addQueryParameter("page", page.toString())
                .addQueryParameter("limit", limit.toString())
            
            category?.let { urlBuilder.addQueryParameter("category", it) }
            status?.let { urlBuilder.addQueryParameter("status", it) }
            search?.let { urlBuilder.addQueryParameter("search", it) }
            
            val request = Request.Builder()
                .url(urlBuilder.build())
                .get()
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    val json = JSONObject(responseBody)
                    if (json.getBoolean("success")) {
                        val data = json.getJSONObject("data")
                        val inventoryArray = data.getJSONArray("inventory")
                        val paginationJson = data.getJSONObject("pagination")
                        
                        val inventory = mutableListOf<InventoryItem>()
                        for (i in 0 until inventoryArray.length()) {
                            val itemJson = inventoryArray.getJSONObject(i)
                            inventory.add(parseInventoryItemFromJson(itemJson))
                        }
                        
                        val pagination = Pagination(
                            page = paginationJson.getInt("page"),
                            limit = paginationJson.getInt("limit"),
                            total = paginationJson.getInt("total"),
                            pages = paginationJson.getInt("pages")
                        )
                        
                        Result.success(InventoryResponse(inventory, pagination))
                    } else {
                        Result.failure(Exception("Failed to load inventory: ${json.getString("message")}"))
                    }
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                Result.failure(Exception("Failed to load inventory: HTTP ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun addInventoryItem(inventoryRequest: InventoryRequest, token: String): Result<InventoryItem> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("name", inventoryRequest.name)
                put("sku", inventoryRequest.sku)
                put("description", inventoryRequest.description)
                put("category", inventoryRequest.category)
                put("price", inventoryRequest.price)
                put("cost", inventoryRequest.cost)
                put("stock", inventoryRequest.stock)
                put("minStock", inventoryRequest.minStock)
                put("maxStock", inventoryRequest.maxStock)
                put("image", inventoryRequest.image)
            }
            
            val requestBody = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$baseUrl/partners/inventory")
                .post(requestBody)
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    val jsonResponse = JSONObject(responseBody)
                    if (jsonResponse.getBoolean("success")) {
                        val data = jsonResponse.getJSONObject("data")
                        Result.success(parseInventoryItemFromJson(data))
                    } else {
                        Result.failure(Exception("Failed to add inventory item: ${jsonResponse.getString("message")}"))
                    }
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                Result.failure(Exception("Failed to add inventory item: HTTP ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateInventoryItem(
        itemId: String,
        update: InventoryUpdate,
        token: String
    ): Result<InventoryItem> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                update.name?.let { put("name", it) }
                update.description?.let { put("description", it) }
                update.category?.let { put("category", it) }
                update.price?.let { put("price", it) }
                update.cost?.let { put("cost", it) }
                update.stock?.let { put("stock", it) }
                update.minStock?.let { put("minStock", it) }
                update.maxStock?.let { put("maxStock", it) }
                update.status?.let { put("status", it.name.lowercase()) }
                update.image?.let { put("image", it) }
            }
            
            val requestBody = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$baseUrl/partners/inventory/$itemId")
                .patch(requestBody)
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    val jsonResponse = JSONObject(responseBody)
                    if (jsonResponse.getBoolean("success")) {
                        val data = jsonResponse.getJSONObject("data")
                        Result.success(parseInventoryItemFromJson(data))
                    } else {
                        Result.failure(Exception("Failed to update inventory item: ${jsonResponse.getString("message")}"))
                    }
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                Result.failure(Exception("Failed to update inventory item: HTTP ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ============================================================================
    // STORE PROFILE API METHODS
    // ============================================================================

    suspend fun getStoreProfile(token: String): Result<StoreProfile> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$baseUrl/partners/profile")
                .get()
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    val json = JSONObject(responseBody)
                    if (json.getBoolean("success")) {
                        val data = json.getJSONObject("data")
                        Result.success(parseStoreProfileFromJson(data))
                    } else {
                        Result.failure(Exception("Failed to load store profile: ${json.getString("message")}"))
                    }
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                Result.failure(Exception("Failed to load store profile: HTTP ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateStoreProfile(update: StoreProfileUpdate, token: String): Result<StoreProfile> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                update.businessName?.let { put("businessName", it) }
                update.ownerName?.let { put("ownerName", it) }
                update.phone?.let { put("phone", it) }
                update.email?.let { put("email", it) }
                update.businessAddress?.let { address ->
                    put("businessAddress", JSONObject().apply {
                        put("street", address.street)
                        put("city", address.city)
                        put("state", address.state)
                        put("zipCode", address.zipCode)
                        put("country", address.country)
                        address.coordinates?.let { coords ->
                            put("coordinates", JSONObject().apply {
                                put("latitude", coords.latitude)
                                put("longitude", coords.longitude)
                            })
                        }
                    })
                }
                update.workingHours?.let { hours ->
                    put("workingHours", JSONObject().apply {
                        put("monday", parseDayHoursToJson(hours.monday))
                        put("tuesday", parseDayHoursToJson(hours.tuesday))
                        put("wednesday", parseDayHoursToJson(hours.wednesday))
                        put("thursday", parseDayHoursToJson(hours.thursday))
                        put("friday", parseDayHoursToJson(hours.friday))
                        put("saturday", parseDayHoursToJson(hours.saturday))
                        put("sunday", parseDayHoursToJson(hours.sunday))
                    })
                }
                update.businessSettings?.let { settings ->
                    put("businessSettings", JSONObject().apply {
                        put("currency", settings.currency)
                        put("timezone", settings.timezone)
                        put("language", settings.language)
                        put("notificationPreferences", parseNotificationPreferencesToJson(settings.notificationPreferences))
                        settings.posSettings?.let { pos ->
                            put("posSettings", JSONObject().apply {
                                put("isConnected", pos.isConnected)
                                put("systemName", pos.systemName)
                                put("lastSync", pos.lastSync?.toISOString())
                                put("autoSync", pos.autoSync)
                            })
                        }
                    })
                }
                update.services?.let { put("services", JSONArray().apply { it.forEach { service -> put(service) } }) }
                update.isConnectedToPOS?.let { put("isConnectedToPOS", it) }
            }
            
            val requestBody = json.toString().toRequestBody("application/json".toMediaType())
            val request = Request.Builder()
                .url("$baseUrl/partners/profile")
                .patch(requestBody)
                .addHeader("Authorization", "Bearer $token")
                .build()

            val response = client.newCall(request).execute()
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                if (responseBody != null) {
                    val jsonResponse = JSONObject(responseBody)
                    if (jsonResponse.getBoolean("success")) {
                        val data = jsonResponse.getJSONObject("data")
                        Result.success(parseStoreProfileFromJson(data))
                    } else {
                        Result.failure(Exception("Failed to update store profile: ${jsonResponse.getString("message")}"))
                    }
                } else {
                    Result.failure(Exception("Empty response from server"))
                }
            } else {
                Result.failure(Exception("Failed to update store profile: HTTP ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // ============================================================================
    // PARSING HELPER METHODS
    // ============================================================================

    private fun parseAppointmentFromJson(json: JSONObject): Appointment {
        return Appointment(
            id = json.getString("id"),
            appointmentId = json.getString("appointmentId"),
            customer = parseCustomerFromJson(json.getJSONObject("customer")),
            vehicle = parseVehicleFromJson(json.getJSONObject("vehicle")),
            service = json.getString("service"),
            description = json.optString("description").takeIf { it.isNotEmpty() },
            scheduledDate = java.util.Date(json.getLong("scheduledDate")),
            estimatedTime = json.optString("estimatedTime").takeIf { it.isNotEmpty() },
            status = AppointmentStatus.valueOf(json.getString("status").uppercase()),
            priority = Priority.valueOf(json.getString("priority").uppercase()),
            notes = json.optString("notes").takeIf { it.isNotEmpty() },
            createdAt = java.util.Date(json.getLong("createdAt")),
            updatedAt = json.optLong("updatedAt").takeIf { it > 0 }?.let { java.util.Date(it) },
            isUrgent = json.optBoolean("isUrgent", false)
        )
    }

    private fun parseCustomerFromJson(json: JSONObject): Customer {
        return Customer(
            name = json.getString("name"),
            phone = json.getString("phone"),
            email = json.optString("email").takeIf { it.isNotEmpty() }
        )
    }

    private fun parseVehicleFromJson(json: JSONObject): Vehicle {
        return Vehicle(
            make = json.optString("make").takeIf { it.isNotEmpty() },
            model = json.optString("model").takeIf { it.isNotEmpty() },
            year = json.optInt("year").takeIf { it > 0 },
            plate = json.optString("plate").takeIf { it.isNotEmpty() }
        )
    }

    private fun parseQuotationFromJson(json: JSONObject): Quotation {
        return Quotation(
            id = json.getString("id"),
            quotationId = json.getString("quotationId"),
            customer = parseCustomerFromJson(json.getJSONObject("customer")),
            service = json.getString("service"),
            description = json.optString("description").takeIf { it.isNotEmpty() },
            total = json.getDouble("total"),
            status = QuotationStatus.valueOf(json.getString("status").uppercase()),
            validUntil = java.util.Date(json.getLong("validUntil")),
            items = json.optJSONArray("items")?.let { array ->
                (0 until array.length()).map { i ->
                    val itemJson = array.getJSONObject(i)
                    QuotationItem(
                        name = itemJson.getString("name"),
                        description = itemJson.optString("description").takeIf { it.isNotEmpty() },
                        quantity = itemJson.getInt("quantity"),
                        unitPrice = itemJson.getDouble("unitPrice"),
                        total = itemJson.getDouble("total")
                    )
                }
            } ?: emptyList(),
            createdAt = java.util.Date(json.getLong("createdAt")),
            isExpired = json.optBoolean("isExpired", false)
        )
    }

    private fun parseInventoryItemFromJson(json: JSONObject): InventoryItem {
        return InventoryItem(
            id = json.getString("id"),
            sku = json.getString("sku"),
            name = json.getString("name"),
            description = json.optString("description").takeIf { it.isNotEmpty() },
            category = json.getString("category"),
            price = json.getDouble("price"),
            cost = json.getDouble("cost"),
            stock = json.getInt("stock"),
            minStock = json.getInt("minStock"),
            maxStock = json.optInt("maxStock").takeIf { it > 0 },
            status = ItemStatus.valueOf(json.getString("status").uppercase()),
            isLowStock = json.optBoolean("isLowStock", false),
            isOutOfStock = json.optBoolean("isOutOfStock", false),
            lastUpdated = java.util.Date(json.getLong("lastUpdated")),
            image = json.optString("image").takeIf { it.isNotEmpty() }
        )
    }

    private fun parseStoreProfileFromJson(json: JSONObject): StoreProfile {
        return StoreProfile(
            businessName = json.getString("businessName"),
            ownerName = json.getString("ownerName"),
            email = json.getString("email"),
            phone = json.getString("phone"),
            partnerType = PartnerType.valueOf(json.getString("partnerType").uppercase()),
            businessAddress = parseBusinessAddressFromJson(json.getJSONObject("businessAddress")),
            workingHours = parseWorkingHoursFromJson(json.getJSONObject("workingHours")),
            businessSettings = parseBusinessSettingsFromJson(json.getJSONObject("businessSettings")),
            services = json.optJSONArray("services")?.let { array ->
                (0 until array.length()).map { array.getString(it) }
            } ?: emptyList(),
            isConnectedToPOS = json.optBoolean("isConnectedToPOS", false),
            isVerified = json.optBoolean("isVerified", false),
            status = PartnerStatus.valueOf(json.getString("status").uppercase()),
            createdAt = java.util.Date(json.getLong("createdAt"))
        )
    }

    private fun parseBusinessAddressFromJson(json: JSONObject): BusinessAddress {
        return BusinessAddress(
            street = json.getString("street"),
            city = json.getString("city"),
            state = json.getString("state"),
            zipCode = json.getString("zipCode"),
            country = json.getString("country"),
            coordinates = json.optJSONObject("coordinates")?.let { coords ->
                Coordinates(
                    latitude = coords.getDouble("latitude"),
                    longitude = coords.getDouble("longitude")
                )
            }
        )
    }

    private fun parseWorkingHoursFromJson(json: JSONObject): WorkingHours {
        return WorkingHours(
            monday = parseDayHoursFromJson(json.getJSONObject("monday")),
            tuesday = parseDayHoursFromJson(json.getJSONObject("tuesday")),
            wednesday = parseDayHoursFromJson(json.getJSONObject("wednesday")),
            thursday = parseDayHoursFromJson(json.getJSONObject("thursday")),
            friday = parseDayHoursFromJson(json.getJSONObject("friday")),
            saturday = parseDayHoursFromJson(json.getJSONObject("saturday")),
            sunday = parseDayHoursFromJson(json.getJSONObject("sunday"))
        )
    }

    private fun parseDayHoursFromJson(json: JSONObject): DayHours {
        return DayHours(
            isOpen = json.getBoolean("isOpen"),
            openTime = json.optString("openTime").takeIf { it.isNotEmpty() },
            closeTime = json.optString("closeTime").takeIf { it.isNotEmpty() },
            breakStart = json.optString("breakStart").takeIf { it.isNotEmpty() },
            breakEnd = json.optString("breakEnd").takeIf { it.isNotEmpty() }
        )
    }

    private fun parseBusinessSettingsFromJson(json: JSONObject): BusinessSettings {
        return BusinessSettings(
            currency = json.getString("currency"),
            timezone = json.getString("timezone"),
            language = json.getString("language"),
            notificationPreferences = parseNotificationPreferencesFromJson(json.getJSONObject("notificationPreferences")),
            posSettings = json.optJSONObject("posSettings")?.let { pos ->
                POSSettings(
                    isConnected = pos.getBoolean("isConnected"),
                    systemName = pos.optString("systemName").takeIf { it.isNotEmpty() },
                    lastSync = pos.optString("lastSync").takeIf { it.isNotEmpty() }?.let { java.util.Date(it) },
                    autoSync = pos.optBoolean("autoSync", false)
                )
            }
        )
    }

    private fun parseNotificationPreferencesFromJson(json: JSONObject): NotificationPreferences {
        return NotificationPreferences(
            pushNotifications = json.getBoolean("pushNotifications"),
            emailNotifications = json.getBoolean("emailNotifications"),
            smsNotifications = json.getBoolean("smsNotifications"),
            orderUpdates = json.getBoolean("orderUpdates"),
            paymentUpdates = json.getBoolean("paymentUpdates"),
            systemUpdates = json.getBoolean("systemUpdates"),
            quietHours = json.optJSONObject("quietHours")?.let { qh ->
                QuietHours(
                    startTime = qh.getString("startTime"),
                    endTime = qh.getString("endTime"),
                    days = qh.optJSONArray("days")?.let { array ->
                        (0 until array.length()).map { array.getString(it) }
                    } ?: emptyList()
                )
            }
        )
    }

    private fun parseDayHoursToJson(dayHours: DayHours): JSONObject {
        return JSONObject().apply {
            put("isOpen", dayHours.isOpen)
            dayHours.openTime?.let { put("openTime", it) }
            dayHours.closeTime?.let { put("closeTime", it) }
            dayHours.breakStart?.let { put("breakStart", it) }
            dayHours.breakEnd?.let { put("breakEnd", it) }
        }
    }

    private fun parseNotificationPreferencesToJson(preferences: NotificationPreferences): JSONObject {
        return JSONObject().apply {
            put("pushNotifications", preferences.pushNotifications)
            put("emailNotifications", preferences.emailNotifications)
            put("smsNotifications", preferences.smsNotifications)
            put("orderUpdates", preferences.orderUpdates)
            put("paymentUpdates", preferences.paymentUpdates)
            put("systemUpdates", preferences.systemUpdates)
            preferences.quietHours?.let { qh ->
                put("quietHours", JSONObject().apply {
                    put("startTime", qh.startTime)
                    put("endTime", qh.endTime)
                    put("days", JSONArray().apply { qh.days.forEach { put(it) } })
                })
            }
        }
    }
    
    // ============================================================================
    // APPOINTMENTS ENDPOINTS
    // ============================================================================
    
    suspend fun getAppointments(
        status: String? = null,
        date: String? = null,
        serviceType: String? = null,
        page: Int = 1,
        limit: Int = 20
    ): Result<AppointmentResponse> = withContext(Dispatchers.IO) {
        try {
            val urlBuilder = HttpUrl.parse("$baseUrl/partners/appointments")?.newBuilder()
                ?: throw Exception("Invalid URL")
            
            status?.let { urlBuilder.addQueryParameter("status", it) }
            date?.let { urlBuilder.addQueryParameter("date", it) }
            serviceType?.let { urlBuilder.addQueryParameter("serviceType", it) }
            urlBuilder.addQueryParameter("page", page.toString())
            urlBuilder.addQueryParameter("limit", limit.toString())
            
            val request = Request.Builder()
                .url(urlBuilder.build())
                .get()
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val json = JSONObject(responseBody ?: "{}")
                
                if (json.getBoolean("success")) {
                    val data = json.getJSONObject("data")
                    val appointments = data.getJSONArray("appointments").let { array ->
                        (0 until array.length()).map { i ->
                            parseAppointmentFromJson(array.getJSONObject(i))
                        }
                    }
                    val pagination = data.getJSONObject("pagination")
                    
                    Result.success(AppointmentResponse(
                        appointments = appointments,
                        pagination = Pagination(
                            page = pagination.getInt("current"),
                            limit = limit,
                            total = pagination.getInt("total"),
                            pages = pagination.getInt("pages")
                        )
                    ))
                } else {
                    Result.failure(Exception(json.getString("message")))
                }
            } else {
                Result.failure(Exception("Failed to get appointments: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getAppointmentDetails(appointmentId: String): Result<Appointment> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$baseUrl/partners/appointments/$appointmentId")
                .get()
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val json = JSONObject(responseBody ?: "{}")
                
                if (json.getBoolean("success")) {
                    val appointment = parseAppointmentFromJson(json.getJSONObject("data"))
                    Result.success(appointment)
                } else {
                    Result.failure(Exception(json.getString("message")))
                }
            } else {
                Result.failure(Exception("Failed to get appointment details: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createAppointment(appointmentRequest: AppointmentRequest): Result<Appointment> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("customerName", appointmentRequest.customerName)
                put("customerPhone", appointmentRequest.customerPhone)
                appointmentRequest.customerEmail?.let { put("customerEmail", it) }
                put("vehicleInfo", JSONObject().apply {
                    put("make", appointmentRequest.vehicleMake ?: "")
                    put("model", appointmentRequest.vehicleModel ?: "")
                    appointmentRequest.vehicleYear?.let { put("year", it) }
                    appointmentRequest.vehiclePlate?.let { put("licensePlate", it) }
                })
                put("serviceType", appointmentRequest.serviceName)
                put("description", appointmentRequest.description ?: "")
                put("scheduledDate", appointmentRequest.scheduledDate.time)
                appointmentRequest.estimatedTime?.let { put("estimatedDuration", it) }
            }
            
            val request = Request.Builder()
                .url("$baseUrl/partners/appointments")
                .post(json.toString().toRequestBody("application/json".toMediaType()))
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val jsonResponse = JSONObject(responseBody ?: "{}")
                
                if (jsonResponse.getBoolean("success")) {
                    val appointment = parseAppointmentFromJson(jsonResponse.getJSONObject("data"))
                    Result.success(appointment)
                } else {
                    Result.failure(Exception(jsonResponse.getString("message")))
                }
            } else {
                Result.failure(Exception("Failed to create appointment: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateAppointmentStatus(appointmentId: String, status: AppointmentStatus): Result<Appointment> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("status", status.name.lowercase())
            }
            
            val request = Request.Builder()
                .url("$baseUrl/partners/appointments/$appointmentId/status")
                .patch(json.toString().toRequestBody("application/json".toMediaType()))
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val jsonResponse = JSONObject(responseBody ?: "{}")
                
                if (jsonResponse.getBoolean("success")) {
                    val appointment = parseAppointmentFromJson(jsonResponse.getJSONObject("data"))
                    Result.success(appointment)
                } else {
                    Result.failure(Exception(jsonResponse.getString("message")))
                }
            } else {
                Result.failure(Exception("Failed to update appointment status: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // ============================================================================
    // QUOTATIONS ENDPOINTS
    // ============================================================================
    
    suspend fun getQuotations(
        status: String? = null,
        quoteType: String? = null,
        page: Int = 1,
        limit: Int = 20
    ): Result<QuotationResponse> = withContext(Dispatchers.IO) {
        try {
            val urlBuilder = HttpUrl.parse("$baseUrl/partners/quotations")?.newBuilder()
                ?: throw Exception("Invalid URL")
            
            status?.let { urlBuilder.addQueryParameter("status", it) }
            quoteType?.let { urlBuilder.addQueryParameter("quoteType", it) }
            urlBuilder.addQueryParameter("page", page.toString())
            urlBuilder.addQueryParameter("limit", limit.toString())
            
            val request = Request.Builder()
                .url(urlBuilder.build())
                .get()
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val json = JSONObject(responseBody ?: "{}")
                
                if (json.getBoolean("success")) {
                    val data = json.getJSONObject("data")
                    val quotations = data.getJSONArray("quotations").let { array ->
                        (0 until array.length()).map { i ->
                            parseQuotationFromJson(array.getJSONObject(i))
                        }
                    }
                    val pagination = data.getJSONObject("pagination")
                    
                    Result.success(QuotationResponse(
                        quotations = quotations,
                        pagination = Pagination(
                            page = pagination.getInt("current"),
                            limit = limit,
                            total = pagination.getInt("total"),
                            pages = pagination.getInt("pages")
                        )
                    ))
                } else {
                    Result.failure(Exception(json.getString("message")))
                }
            } else {
                Result.failure(Exception("Failed to get quotations: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getQuotationDetails(quotationId: String): Result<Quotation> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$baseUrl/partners/quotations/$quotationId")
                .get()
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val json = JSONObject(responseBody ?: "{}")
                
                if (json.getBoolean("success")) {
                    val quotation = parseQuotationFromJson(json.getJSONObject("data"))
                    Result.success(quotation)
                } else {
                    Result.failure(Exception(json.getString("message")))
                }
            } else {
                Result.failure(Exception("Failed to get quotation details: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun createQuotation(quotationRequest: QuotationRequest): Result<Quotation> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("customerName", quotationRequest.customerName)
                put("customerPhone", quotationRequest.customerPhone)
                quotationRequest.customerEmail?.let { put("customerEmail", it) }
                put("vehicleInfo", JSONObject().apply {
                    put("make", "Unknown") // Default values
                    put("model", "Unknown")
                })
                put("quoteType", quotationRequest.serviceName)
                put("description", quotationRequest.description ?: "")
                put("items", quotationRequest.items.map { item ->
                    JSONObject().apply {
                        put("name", item.name)
                        put("description", item.description ?: "")
                        put("quantity", item.quantity)
                        put("unitPrice", item.unitPrice)
                        put("total", item.total)
                    }
                })
                put("validUntil", quotationRequest.validUntil?.time ?: System.currentTimeMillis() + 7 * 24 * 60 * 60 * 1000L)
                put("taxRate", 0.14) // 14% VAT
            }
            
            val request = Request.Builder()
                .url("$baseUrl/partners/quotations")
                .post(json.toString().toRequestBody("application/json".toMediaType()))
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val jsonResponse = JSONObject(responseBody ?: "{}")
                
                if (jsonResponse.getBoolean("success")) {
                    val quotation = parseQuotationFromJson(jsonResponse.getJSONObject("data"))
                    Result.success(quotation)
                } else {
                    Result.failure(Exception(jsonResponse.getString("message")))
                }
            } else {
                Result.failure(Exception("Failed to create quotation: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateQuotation(quotationId: String, updateData: Map<String, Any>): Result<Quotation> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject(updateData)
            
            val request = Request.Builder()
                .url("$baseUrl/partners/quotations/$quotationId")
                .patch(json.toString().toRequestBody("application/json".toMediaType()))
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val jsonResponse = JSONObject(responseBody ?: "{}")
                
                if (jsonResponse.getBoolean("success")) {
                    val quotation = parseQuotationFromJson(jsonResponse.getJSONObject("data"))
                    Result.success(quotation)
                } else {
                    Result.failure(Exception(jsonResponse.getString("message")))
                }
            } else {
                Result.failure(Exception("Failed to update quotation: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun sendQuotation(quotationId: String): Result<Quotation> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$baseUrl/partners/quotations/$quotationId/send")
                .post("".toRequestBody("application/json".toMediaType()))
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val jsonResponse = JSONObject(responseBody ?: "{}")
                
                if (jsonResponse.getBoolean("success")) {
                    val quotation = parseQuotationFromJson(jsonResponse.getJSONObject("data"))
                    Result.success(quotation)
                } else {
                    Result.failure(Exception(jsonResponse.getString("message")))
                }
            } else {
                Result.failure(Exception("Failed to send quotation: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // ============================================================================
    // INVENTORY ENDPOINTS
    // ============================================================================
    
    suspend fun getInventory(
        category: String? = null,
        status: String? = null,
        search: String? = null,
        page: Int = 1,
        limit: Int = 20
    ): Result<InventoryResponse> = withContext(Dispatchers.IO) {
        try {
            val urlBuilder = HttpUrl.parse("$baseUrl/partners/inventory")?.newBuilder()
                ?: throw Exception("Invalid URL")
            
            category?.let { urlBuilder.addQueryParameter("category", it) }
            status?.let { urlBuilder.addQueryParameter("status", it) }
            search?.let { urlBuilder.addQueryParameter("search", it) }
            urlBuilder.addQueryParameter("page", page.toString())
            urlBuilder.addQueryParameter("limit", limit.toString())
            
            val request = Request.Builder()
                .url(urlBuilder.build())
                .get()
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val json = JSONObject(responseBody ?: "{}")
                
                if (json.getBoolean("success")) {
                    val data = json.getJSONObject("data")
                    val inventory = data.getJSONArray("inventory").let { array ->
                        (0 until array.length()).map { i ->
                            parseInventoryItemFromJson(array.getJSONObject(i))
                        }
                    }
                    val pagination = data.getJSONObject("pagination")
                    
                    Result.success(InventoryResponse(
                        inventory = inventory,
                        pagination = Pagination(
                            page = pagination.getInt("current"),
                            limit = limit,
                            total = pagination.getInt("total"),
                            pages = pagination.getInt("pages")
                        )
                    ))
                } else {
                    Result.failure(Exception(json.getString("message")))
                }
            } else {
                Result.failure(Exception("Failed to get inventory: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getInventoryItemDetails(itemId: String): Result<InventoryItem> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$baseUrl/partners/inventory/$itemId")
                .get()
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val json = JSONObject(responseBody ?: "{}")
                
                if (json.getBoolean("success")) {
                    val item = parseInventoryItemFromJson(json.getJSONObject("data"))
                    Result.success(item)
                } else {
                    Result.failure(Exception(json.getString("message")))
                }
            } else {
                Result.failure(Exception("Failed to get inventory item details: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun addInventoryItem(inventoryRequest: InventoryRequest): Result<InventoryItem> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject().apply {
                put("name", inventoryRequest.name)
                inventoryRequest.sku?.let { put("sku", it) }
                inventoryRequest.description?.let { put("description", it) }
                put("category", inventoryRequest.category)
                put("costPrice", inventoryRequest.cost ?: 0.0)
                put("salePrice", inventoryRequest.price)
                put("quantity", inventoryRequest.stock)
                put("minQuantity", inventoryRequest.minStock)
                inventoryRequest.maxStock?.let { put("maxQuantity", it) }
                inventoryRequest.image?.let { put("image", it) }
            }
            
            val request = Request.Builder()
                .url("$baseUrl/partners/inventory")
                .post(json.toString().toRequestBody("application/json".toMediaType()))
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val jsonResponse = JSONObject(responseBody ?: "{}")
                
                if (jsonResponse.getBoolean("success")) {
                    val item = parseInventoryItemFromJson(jsonResponse.getJSONObject("data"))
                    Result.success(item)
                } else {
                    Result.failure(Exception(jsonResponse.getString("message")))
                }
            } else {
                Result.failure(Exception("Failed to add inventory item: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun updateInventoryItem(itemId: String, updateData: Map<String, Any>): Result<InventoryItem> = withContext(Dispatchers.IO) {
        try {
            val json = JSONObject(updateData)
            
            val request = Request.Builder()
                .url("$baseUrl/partners/inventory/$itemId")
                .patch(json.toString().toRequestBody("application/json".toMediaType()))
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val jsonResponse = JSONObject(responseBody ?: "{}")
                
                if (jsonResponse.getBoolean("success")) {
                    val item = parseInventoryItemFromJson(jsonResponse.getJSONObject("data"))
                    Result.success(item)
                } else {
                    Result.failure(Exception(jsonResponse.getString("message")))
                }
            } else {
                Result.failure(Exception("Failed to update inventory item: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun deleteInventoryItem(itemId: String): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$baseUrl/partners/inventory/$itemId")
                .delete()
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val json = JSONObject(responseBody ?: "{}")
                
                if (json.getBoolean("success")) {
                    Result.success(true)
                } else {
                    Result.failure(Exception(json.getString("message")))
                }
            } else {
                Result.failure(Exception("Failed to delete inventory item: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun getInventoryStats(): Result<Map<String, Any>> = withContext(Dispatchers.IO) {
        try {
            val request = Request.Builder()
                .url("$baseUrl/partners/inventory/stats")
                .get()
                .build()
            
            val response = client.newCall(request).execute()
            
            if (response.isSuccessful) {
                val responseBody = response.body?.string()
                val json = JSONObject(responseBody ?: "{}")
                
                if (json.getBoolean("success")) {
                    val stats = json.getJSONObject("data")
                    val statsMap = mutableMapOf<String, Any>()
                    stats.keys().forEach { key ->
                        statsMap[key] = stats.get(key)
                    }
                    Result.success(statsMap)
                } else {
                    Result.failure(Exception(json.getString("message")))
                }
            } else {
                Result.failure(Exception("Failed to get inventory stats: ${response.code}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Helper function to parse appointment from JSON
    private fun parseAppointmentFromJson(json: JSONObject): Appointment {
        return Appointment(
            id = json.getString("_id"),
            appointmentId = json.optString("appointmentId", json.getString("_id")),
            customer = Customer(
                name = json.getString("customerName"),
                phone = json.getString("customerPhone"),
                email = json.optString("customerEmail").takeIf { it.isNotEmpty() }
            ),
            vehicle = Vehicle(
                make = json.optJSONObject("vehicleInfo")?.optString("make"),
                model = json.optJSONObject("vehicleInfo")?.optString("model"),
                year = json.optJSONObject("vehicleInfo")?.optInt("year")?.takeIf { it > 0 },
                plate = json.optJSONObject("vehicleInfo")?.optString("licensePlate")
            ),
            service = json.getString("serviceType"),
            description = json.optString("description").takeIf { it.isNotEmpty() },
            scheduledDate = java.util.Date(json.getLong("scheduledDate")),
            estimatedTime = json.optString("estimatedDuration").takeIf { it.isNotEmpty() },
            status = AppointmentStatus.valueOf(json.getString("status").uppercase()),
            priority = Priority.NORMAL, // Default priority
            notes = json.optString("notes").takeIf { it.isNotEmpty() },
            createdAt = java.util.Date(json.getLong("createdAt")),
            updatedAt = json.optLong("updatedAt").takeIf { it > 0 }?.let { java.util.Date(it) }
        )
    }
    
}
