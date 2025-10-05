package com.clutch.partners.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.annotations.SerializedName

@Entity(tableName = "notifications")
data class NotificationData(
    @PrimaryKey
    val id: String,
    val title: String,
    val message: String,
    val type: String,
    val isRead: Boolean = false,
    val timestamp: Long,
    val orderId: String? = null,
    val paymentId: String? = null,
    val priority: String = "normal",
    val actionUrl: String? = null,
    val imageUrl: String? = null
) : com.clutch.partners.offline.SyncableData

data class NotificationRequest(
    @SerializedName("title") val title: String,
    @SerializedName("body") val body: String,
    @SerializedName("recipient") val recipient: String
)

data class NotificationResponse(
    @SerializedName("success") val success: Boolean,
    @SerializedName("message") val message: String?
)

data class EmailNotification(
    @SerializedName("to") val to: String,
    @SerializedName("subject") val subject: String,
    @SerializedName("body") val body: String,
    @SerializedName("type") val type: String,
    @SerializedName("isHtml") val isHtml: Boolean = false
)

data class SMSNotification(
    @SerializedName("to") val to: String,
    @SerializedName("message") val message: String,
    @SerializedName("type") val type: String
)