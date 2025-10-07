package com.clutch.partners.data.model

import java.util.Date

data class SupportTicket(
    val id: String,
    val subject: String,
    val description: String,
    val priority: TicketPriority,
    val category: TicketCategory,
    val status: TicketStatus,
    val createdAt: Date,
    val updatedAt: Date,
    val userId: String,
    val assignedTo: String? = null,
    val attachments: List<String> = emptyList(),
    val messages: List<TicketMessage> = emptyList()
)

enum class TicketPriority {
    LOW,
    MEDIUM,
    HIGH,
    URGENT
}

enum class TicketCategory {
    TECHNICAL,
    BILLING,
    GENERAL,
    FEATURE_REQUEST,
    BUG_REPORT
}

enum class TicketStatus {
    OPEN,
    IN_PROGRESS,
    RESOLVED,
    CLOSED
}

data class TicketMessage(
    val id: String,
    val content: String,
    val senderId: String,
    val senderName: String,
    val isFromSupport: Boolean,
    val createdAt: Date,
    val attachments: List<String> = emptyList()
)
