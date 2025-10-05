package com.clutch.partners.websocket

import android.util.Log
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
    private val client = OkHttpClient()
    
    private val _connectionStatus = MutableStateFlow(ConnectionStatus.DISCONNECTED)
    val connectionStatus: StateFlow<ConnectionStatus> = _connectionStatus.asStateFlow()
    
    private val _messages = MutableStateFlow<List<WebSocketMessage>>(emptyList())
    val messages: StateFlow<List<WebSocketMessage>> = _messages.asStateFlow()
    
    private val messageListeners = mutableListOf<WebSocketMessageListener>()
    
    fun connect(url: String, token: String) {
                val request = Request.Builder()
            .url("$url?token=$token")
                    .build()
                
        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                _connectionStatus.value = ConnectionStatus.CONNECTED
                Log.d("WebSocket", "Connected")
            }
            
            override fun onMessage(webSocket: WebSocket, text: String) {
                handleMessage(text)
            }
            
            override fun onMessage(webSocket: WebSocket, bytes: ByteString) {
                handleMessage(bytes.utf8())
            }
            
            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                _connectionStatus.value = ConnectionStatus.DISCONNECTING
            }
            
            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                _connectionStatus.value = ConnectionStatus.DISCONNECTED
                Log.d("WebSocket", "Disconnected")
            }
            
            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                _connectionStatus.value = ConnectionStatus.FAILED
                Log.e("WebSocket", "Connection failed", t)
            }
        })
    }
    
    fun disconnect() {
        webSocket?.close(1000, "Normal closure")
        webSocket = null
    }
    
    fun sendMessage(message: WebSocketMessage) {
        webSocket?.let { ws ->
            val json = JSONObject().apply {
                put("type", message.type)
                put("data", message.data)
                put("timestamp", message.timestamp)
            }
            ws.send(json.toString())
        }
    }
    
    fun addMessageListener(listener: WebSocketMessageListener) {
        messageListeners.add(listener)
    }
    
    fun removeMessageListener(listener: WebSocketMessageListener) {
        messageListeners.remove(listener)
    }
    
    private fun handleMessage(message: String) {
        try {
            val json = JSONObject(message)
            val type = json.getString("type")
            val data = json.getJSONObject("data")
            val timestamp = json.getLong("timestamp")
            
            val wsMessage = WebSocketMessage(
                type = type,
                data = data,
                timestamp = timestamp
            )
            
            // Update messages list
            _messages.value = _messages.value + wsMessage
            
            // Notify listeners
            messageListeners.forEach { listener ->
                when (type) {
                    "order_update" -> listener.onOrderUpdate(data)
                    "payment_update" -> listener.onPaymentUpdate(data)
                    "appointment_update" -> listener.onAppointmentUpdate(data)
                    "notification" -> listener.onNotification(data)
                    "chat_message" -> listener.onChatMessage(data)
                    "inventory_update" -> listener.onInventoryUpdate(data)
                    "customer_update" -> listener.onCustomerUpdate(data)
                    "staff_update" -> listener.onStaffUpdate(data)
                    "system_message" -> listener.onSystemMessage(data)
                }
            }
            } catch (e: Exception) {
            Log.e("WebSocket", "Error parsing message", e)
        }
    }
}

enum class ConnectionStatus {
    DISCONNECTED,
    CONNECTING,
    CONNECTED,
    DISCONNECTING,
    FAILED
}

data class WebSocketMessage(
    val type: String,
    val data: JSONObject,
    val timestamp: Long
)

interface WebSocketMessageListener {
    fun onOrderUpdate(data: JSONObject)
    fun onPaymentUpdate(data: JSONObject)
    fun onAppointmentUpdate(data: JSONObject)
    fun onNotification(data: JSONObject)
    fun onChatMessage(data: JSONObject)
    fun onInventoryUpdate(data: JSONObject)
    fun onCustomerUpdate(data: JSONObject)
    fun onStaffUpdate(data: JSONObject)
    fun onSystemMessage(data: JSONObject)
}