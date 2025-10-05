package com.clutch.partners.websocket

import android.util.Log
import com.clutch.partners.data.model.*
import android.os.Bundle
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import okhttp3.*
import okio.ByteString
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WebSocketManager @Inject constructor() {
    
    private var webSocket: WebSocket? = null
    private var client: OkHttpClient? = null
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    
    private val _connectionState = MutableStateFlow(WebSocketState.DISCONNECTED)
    val connectionState: StateFlow<WebSocketState> = _connectionState.asStateFlow()
    
    private val _realtimeOrders = MutableStateFlow<List<Order>>(emptyList())
    val realtimeOrders: StateFlow<List<Order>> = _realtimeOrders.asStateFlow()
    
    private val _realtimePayments = MutableStateFlow<List<Payment>>(emptyList())
    val realtimePayments: StateFlow<List<Payment>> = _realtimePayments.asStateFlow()
    
    private val _realtimeNotifications = MutableStateFlow<List<NotificationData>>(emptyList())
    val realtimeNotifications: StateFlow<List<NotificationData>> = _realtimeNotifications.asStateFlow()
    
    private val _realtimeInventory = MutableStateFlow<List<Product>>(emptyList())
    val realtimeInventory: StateFlow<List<Product>> = _realtimeInventory.asStateFlow()
    
    fun connect(partnerId: String, authToken: String) {
        scope.launch {
            try {
                _connectionState.value = WebSocketState.CONNECTING
                
                client = OkHttpClient.Builder()
                    .pingInterval(30, java.util.concurrent.TimeUnit.SECONDS)
                    .build()
                
                val request = Request.Builder()
                    .url("wss://api.clutch.com/ws/partners/$partnerId")
                    .addHeader("Authorization", "Bearer $authToken")
                    .build()
                
                webSocket = client?.newWebSocket(request, createWebSocketListener())
                
            } catch (e: Exception) {
                Log.e("WebSocketManager", "Failed to connect", e)
                _connectionState.value = WebSocketState.DISCONNECTED
            }
        }
    }
    
    fun disconnect() {
        scope.launch {
            try {
                webSocket?.close(1000, "Client disconnect")
                webSocket = null
                client = null
                _connectionState.value = WebSocketState.DISCONNECTED
            } catch (e: Exception) {
                Log.e("WebSocketManager", "Failed to disconnect", e)
            }
        }
    }
    
    fun sendMessage(message: WebSocketMessage) {
        scope.launch {
            try {
                val json = JSONObject().apply {
                    put("type", message.type)
                    put("data", message.data)
                    put("timestamp", System.currentTimeMillis())
                }
                
                webSocket?.send(json.toString())
            } catch (e: Exception) {
                Log.e("WebSocketManager", "Failed to send message", e)
            }
        }
    }
    
    fun subscribeToOrders() {
        sendMessage(WebSocketMessage("subscribe", mapOf("channel" to "orders")))
    }
    
    fun subscribeToPayments() {
        sendMessage(WebSocketMessage("subscribe", mapOf("channel" to "payments")))
    }
    
    fun subscribeToNotifications() {
        sendMessage(WebSocketMessage("subscribe", mapOf("channel" to "notifications")))
    }
    
    fun subscribeToInventory() {
        sendMessage(WebSocketMessage("subscribe", mapOf("channel" to "inventory")))
    }
    
    private fun createWebSocketListener(): WebSocketListener {
        return object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.d("WebSocketManager", "WebSocket connected")
                _connectionState.value = WebSocketState.CONNECTED
                
                // Subscribe to all channels
                subscribeToOrders()
                subscribeToPayments()
                subscribeToNotifications()
                subscribeToInventory()
            }
            
            override fun onMessage(webSocket: WebSocket, text: String) {
                handleMessage(text)
            }
            
            override fun onMessage(webSocket: WebSocket, bytes: ByteString) {
                handleMessage(bytes.utf8())
            }
            
            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                Log.d("WebSocketManager", "WebSocket closing: $code $reason")
            }
            
            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                Log.d("WebSocketManager", "WebSocket closed: $code $reason")
                _connectionState.value = WebSocketState.DISCONNECTED
            }
            
            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e("WebSocketManager", "WebSocket failed", t)
                _connectionState.value = WebSocketState.DISCONNECTED
                
                // Attempt to reconnect after delay
                scope.launch {
                    delay(5000)
                    if (_connectionState.value == WebSocketState.DISCONNECTED) {
                        // Reconnect logic would go here
                    }
                }
            }
        }
    }
    
    private fun handleMessage(message: String) {
        try {
            val json = JSONObject(message)
            val type = json.getString("type")
            val data = json.getJSONObject("data")
            
            when (type) {
                "order_update" -> handleOrderUpdate(data)
                "payment_update" -> handlePaymentUpdate(data)
                "notification" -> handleNotification(data)
                "inventory_update" -> handleInventoryUpdate(data)
                "pong" -> handlePong()
                else -> Log.d("WebSocketManager", "Unknown message type: $type")
            }
        } catch (e: Exception) {
            Log.e("WebSocketManager", "Failed to handle message", e)
        }
    }
    
    private fun handleOrderUpdate(data: JSONObject) {
        scope.launch {
            try {
                val order = parseOrderFromJson(data)
                val currentOrders = _realtimeOrders.value.toMutableList()
                val existingIndex = currentOrders.indexOfFirst { it.id == order.id }
                
                if (existingIndex >= 0) {
                    currentOrders[existingIndex] = order
                } else {
                    currentOrders.add(order)
                }
                
                _realtimeOrders.value = currentOrders
            } catch (e: Exception) {
                Log.e("WebSocketManager", "Failed to handle order update", e)
            }
        }
    }
    
    private fun handlePaymentUpdate(data: JSONObject) {
        scope.launch {
            try {
                val payment = parsePaymentFromJson(data)
                val currentPayments = _realtimePayments.value.toMutableList()
                val existingIndex = currentPayments.indexOfFirst { it.id == payment.id }
                
                if (existingIndex >= 0) {
                    currentPayments[existingIndex] = payment
                } else {
                    currentPayments.add(payment)
                }
                
                _realtimePayments.value = currentPayments
            } catch (e: Exception) {
                Log.e("WebSocketManager", "Failed to handle payment update", e)
            }
        }
    }
    
    private fun handleNotification(data: JSONObject) {
        scope.launch {
            try {
                val notification = parseNotificationFromJson(data)
                val currentNotifications = _realtimeNotifications.value.toMutableList()
                currentNotifications.add(0, notification) // Add to beginning
                
                // Keep only last 100 notifications
                if (currentNotifications.size > 100) {
                    currentNotifications.removeAt(currentNotifications.size - 1)
                }
                
                _realtimeNotifications.value = currentNotifications
            } catch (e: Exception) {
                Log.e("WebSocketManager", "Failed to handle notification", e)
            }
        }
    }
    
    private fun handleInventoryUpdate(data: JSONObject) {
        scope.launch {
            try {
                val product = parseProductFromJson(data)
                val currentInventory = _realtimeInventory.value.toMutableList()
                val existingIndex = currentInventory.indexOfFirst { it.id == product.id }
                
                if (existingIndex >= 0) {
                    currentInventory[existingIndex] = product
                } else {
                    currentInventory.add(product)
                }
                
                _realtimeInventory.value = currentInventory
            } catch (e: Exception) {
                Log.e("WebSocketManager", "Failed to handle inventory update", e)
            }
        }
    }
    
    private fun handlePong() {
        Log.d("WebSocketManager", "Received pong")
    }
    
    private fun parseOrderFromJson(json: JSONObject): Order {
        // Parse order from JSON
        return Order(
            id = json.getString("id"),
            customerName = json.getString("customerName"),
            customerPhone = json.getString("customerPhone"),
            totalAmount = json.getDouble("totalAmount"),
            status = json.getString("status"),
            createdAt = json.getLong("createdAt")
        )
    }
    
    private fun parsePaymentFromJson(json: JSONObject): Payment {
        // Parse payment from JSON
        return Payment(
            id = json.getString("id"),
            orderId = json.getString("orderId"),
            amount = json.getDouble("amount"),
            method = json.getString("method"),
            status = json.getString("status"),
            createdAt = json.getLong("createdAt")
        )
    }
    
    private fun parseNotificationFromJson(json: JSONObject): NotificationData {
        // Parse notification from JSON
        return NotificationData(
            id = json.getString("id"),
            title = json.getString("title"),
            message = json.getString("message"),
            type = json.getString("type"),
            timestamp = json.getLong("timestamp")
        )
    }
    
    private fun parseProductFromJson(json: JSONObject): Product {
        // Parse product from JSON
        return Product(
            id = json.getString("id"),
            name = json.getString("name"),
            price = json.getDouble("price"),
            stock = json.getInt("stock"),
            category = json.getString("category")
        )
    }
}

enum class WebSocketState {
    CONNECTING,
    CONNECTED,
    DISCONNECTED,
    ERROR
}

data class WebSocketMessage(
    val type: String,
    val data: Map<String, Any>
)
