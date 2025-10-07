package com.clutch.partners.data.model

import com.google.gson.annotations.SerializedName

data class ApprovalRequest(
    @SerializedName("_id")
    val id: String,
    @SerializedName("partnerId")
    val partnerId: String,
    @SerializedName("requesterEmail")
    val requesterEmail: String,
    @SerializedName("requesterPhone")
    val requesterPhone: String,
    @SerializedName("requesterName")
    val requesterName: String,
    @SerializedName("requestedRole")
    val requestedRole: String,
    @SerializedName("requestedPermissions")
    val requestedPermissions: List<String> = emptyList(),
    @SerializedName("status")
    val status: String, // pending, approved, rejected, expired
    @SerializedName("approvedBy")
    val approvedBy: String? = null,
    @SerializedName("approvedAt")
    val approvedAt: String? = null,
    @SerializedName("rejectionReason")
    val rejectionReason: String? = null,
    @SerializedName("approvedRole")
    val approvedRole: String? = null,
    @SerializedName("approvedPermissions")
    val approvedPermissions: List<String> = emptyList(),
    @SerializedName("businessJustification")
    val businessJustification: String = "",
    @SerializedName("notes")
    val notes: String = "",
    @SerializedName("createdAt")
    val createdAt: String,
    @SerializedName("updatedAt")
    val updatedAt: String,
    @SerializedName("expiresAt")
    val expiresAt: String
) {
    // Computed properties
    val daysSinceRequest: Int
        get() {
            val created = java.time.Instant.parse(createdAt).atZone(java.time.ZoneId.systemDefault()).toLocalDate()
            val now = java.time.LocalDate.now()
            return java.time.temporal.ChronoUnit.DAYS.between(created, now).toInt()
        }

    val isExpired: Boolean
        get() {
            val expiry = java.time.Instant.parse(expiresAt).atZone(java.time.ZoneId.systemDefault()).toLocalDateTime()
            val now = java.time.LocalDateTime.now()
            return now.isAfter(expiry)
        }

    val daysUntilExpiry: Int
        get() {
            val expiry = java.time.Instant.parse(expiresAt).atZone(java.time.ZoneId.systemDefault()).toLocalDate()
            val now = java.time.LocalDate.now()
            return java.time.temporal.ChronoUnit.DAYS.between(now, expiry).toInt()
        }
}
