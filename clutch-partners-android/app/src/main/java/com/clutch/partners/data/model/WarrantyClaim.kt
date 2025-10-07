package com.clutch.partners.data.model

import java.util.Date

data class WarrantyClaim(
    val id: String,
    val orderId: String,
    val productId: String,
    val customerId: String,
    val customerName: String,
    val productName: String,
    val issue: String,
    val description: String,
    val status: WarrantyStatus,
    val priority: WarrantyPriority,
    val createdAt: Date,
    val updatedAt: Date,
    val resolvedAt: Date? = null,
    val assignedTo: String? = null,
    val attachments: List<String> = emptyList(),
    val resolution: String? = null,
    val compensation: Double? = null,
    val notes: List<WarrantyNote> = emptyList()
)

enum class WarrantyStatus {
    PENDING,
    UNDER_REVIEW,
    APPROVED,
    REJECTED,
    RESOLVED,
    CLOSED
}

enum class WarrantyPriority {
    LOW,
    MEDIUM,
    HIGH,
    URGENT
}

data class WarrantyNote(
    val id: String,
    val content: String,
    val authorId: String,
    val authorName: String,
    val createdAt: Date,
    val isInternal: Boolean = false
)

data class Dispute(
    val id: String,
    val orderId: String,
    val customerId: String,
    val customerName: String,
    val reason: String,
    val description: String,
    val status: DisputeStatus,
    val priority: DisputePriority,
    val createdAt: Date,
    val updatedAt: Date,
    val resolvedAt: Date? = null,
    val assignedTo: String? = null,
    val attachments: List<String> = emptyList(),
    val resolution: String? = null,
    val compensation: Double? = null,
    val notes: List<DisputeNote> = emptyList()
)

enum class DisputeStatus {
    PENDING,
    UNDER_REVIEW,
    APPROVED,
    REJECTED,
    RESOLVED,
    CLOSED
}

enum class DisputePriority {
    LOW,
    MEDIUM,
    HIGH,
    URGENT
}

data class DisputeNote(
    val id: String,
    val content: String,
    val authorId: String,
    val authorName: String,
    val createdAt: Date,
    val isInternal: Boolean = false
)
