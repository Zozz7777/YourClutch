package com.clutch.partners.data.model

import java.util.Date

data class Notification(
    val id: String,
    val title: String,
    val message: String,
    val type: NotificationType,
    val isRead: Boolean,
    val createdAt: Date,
    val actionUrl: String?,
    val metadata: Map<String, String>?
)

enum class NotificationType {
    ORDER,
    PAYMENT,
    APPOINTMENT,
    INVENTORY,
    SYSTEM,
    PROMOTION
}
