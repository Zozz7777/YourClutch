package com.clutch.partners.websocket

import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LiveChatManager @Inject constructor(
    private val webSocketManager: WebSocketManager
) {
    private val _chatMessages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val chatMessages: StateFlow<List<ChatMessage>> = _chatMessages.asStateFlow()
    
    private val _isTyping = MutableStateFlow(false)
    val isTyping: StateFlow<Boolean> = _isTyping.asStateFlow()
    
    private val _supportAgents = MutableStateFlow<List<SupportAgent>>(emptyList())
    val supportAgents: StateFlow<List<SupportAgent>> = _supportAgents.asStateFlow()
    
    init {
        webSocketManager.addMessageListener(object : WebSocketMessageListener {
            override fun onOrderUpdate(data: JSONObject) {}
            override fun onPaymentUpdate(data: JSONObject) {}
            override fun onAppointmentUpdate(data: JSONObject) {}
            override fun onNotification(data: JSONObject) {}
            override fun onChatMessage(data: JSONObject) {
                handleChatMessage(data)
            }
            override fun onInventoryUpdate(data: JSONObject) {}
            override fun onCustomerUpdate(data: JSONObject) {}
            override fun onStaffUpdate(data: JSONObject) {}
            override fun onSystemMessage(data: JSONObject) {
                handleSystemMessage(data)
            }
        })
    }
    
    fun sendMessage(message: String, recipientId: String? = null) {
        val chatMessage = ChatMessage(
            id = System.currentTimeMillis().toString(),
            senderId = "current_user", // Current user ID
            recipientId = recipientId,
            message = message,
            timestamp = System.currentTimeMillis(),
            isFromSupport = false
        )
        
        // Add to local messages
        _chatMessages.value = _chatMessages.value + chatMessage
        
        // Send via WebSocket
        val messageData = JSONObject().apply {
            put("message", message)
            put("recipientId", recipientId)
            put("timestamp", chatMessage.timestamp)
        }
        
        val wsMessage = WebSocketMessage(
            type = "chat_message",
            data = messageData,
            timestamp = System.currentTimeMillis()
        )
        
        webSocketManager.sendMessage(wsMessage)
    }
    
    fun startTyping() {
        _isTyping.value = true
        sendTypingStatus(true)
    }
    
    fun stopTyping() {
        _isTyping.value = false
        sendTypingStatus(false)
    }
    
    fun requestSupport() {
        val requestData = JSONObject().apply {
            put("type", "support_request")
            put("timestamp", System.currentTimeMillis())
        }
        
        val wsMessage = WebSocketMessage(
            type = "support_request",
            data = requestData,
            timestamp = System.currentTimeMillis()
        )
        
        webSocketManager.sendMessage(wsMessage)
    }
    
    fun endChat() {
        val endData = JSONObject().apply {
            put("type", "chat_end")
            put("timestamp", System.currentTimeMillis())
        }
        
        val wsMessage = WebSocketMessage(
            type = "chat_end",
            data = endData,
            timestamp = System.currentTimeMillis()
        )
        
        webSocketManager.sendMessage(wsMessage)
    }
    
    private fun handleChatMessage(data: JSONObject) {
        val message = ChatMessage(
            id = data.getString("id"),
            senderId = data.getString("senderId"),
            recipientId = data.optString("recipientId"),
            message = data.getString("message"),
            timestamp = data.getLong("timestamp"),
            isFromSupport = data.getBoolean("isFromSupport")
        )
        
        _chatMessages.value = _chatMessages.value + message
    }
    
    private fun handleSystemMessage(data: JSONObject) {
        val message = data.getString("message")
        val type = data.getString("type")
        
        when (type) {
            "agent_joined" -> {
                val agent = SupportAgent(
                    id = data.getString("agentId"),
                    name = data.getString("agentName"),
                    isOnline = true
                )
                _supportAgents.value = _supportAgents.value + agent
            }
            "agent_left" -> {
                val agentId = data.getString("agentId")
                _supportAgents.value = _supportAgents.value.filter { it.id != agentId }
            }
            "typing_start" -> {
                _isTyping.value = true
            }
            "typing_stop" -> {
                _isTyping.value = false
            }
        }
    }
    
    private fun sendTypingStatus(isTyping: Boolean) {
        val typingData = JSONObject().apply {
            put("isTyping", isTyping)
            put("timestamp", System.currentTimeMillis())
        }
        
        val wsMessage = WebSocketMessage(
            type = "typing_status",
            data = typingData,
            timestamp = System.currentTimeMillis()
        )
        
        webSocketManager.sendMessage(wsMessage)
    }
}

data class ChatMessage(
    val id: String,
    val senderId: String,
    val recipientId: String?,
    val message: String,
    val timestamp: Long,
    val isFromSupport: Boolean
)

data class SupportAgent(
    val id: String,
    val name: String,
    val isOnline: Boolean
)
