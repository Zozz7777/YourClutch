package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class NotificationData(
    @SerializedName("id")
    val id: String,
    @SerializedName("title")
    val title: String,
    @SerializedName("body")
    val body: String,
    @SerializedName("type")
    val type: String, // service, booking, loyalty, maintenance, promotion
    @SerializedName("data")
    val data: Map<String, String>,
    @SerializedName("timestamp")
    val timestamp: Long,
    @SerializedName("isRead")
    val isRead: Boolean = false
)

data class NotificationSettings(
    @SerializedName("serviceNotifications")
    val serviceNotifications: Boolean = true,
    @SerializedName("bookingNotifications")
    val bookingNotifications: Boolean = true,
    @SerializedName("loyaltyNotifications")
    val loyaltyNotifications: Boolean = true,
    @SerializedName("maintenanceNotifications")
    val maintenanceNotifications: Boolean = true,
    @SerializedName("promotionNotifications")
    val promotionNotifications: Boolean = false,
    @SerializedName("pushNotifications")
    val pushNotifications: Boolean = true,
    @SerializedName("emailNotifications")
    val emailNotifications: Boolean = true,
    @SerializedName("smsNotifications")
    val smsNotifications: Boolean = false
)

data class NotificationHistory(
    @SerializedName("notifications")
    val notifications: List<NotificationData>,
    @SerializedName("totalCount")
    val totalCount: Int,
    @SerializedName("unreadCount")
    val unreadCount: Int
)

data class NotificationRequest(
    @SerializedName("title")
    val title: String,
    @SerializedName("body")
    val body: String,
    @SerializedName("type")
    val type: String,
    @SerializedName("data")
    val data: Map<String, String>
)

data class NotificationResponse(
    @SerializedName("success")
    val success: Boolean,
    @SerializedName("notificationId")
    val notificationId: String?,
    @SerializedName("message")
    val message: String
)
