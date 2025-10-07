package com.clutch.partners.data.model

import java.util.Date

data class AuditLog(
    val id: String,
    val userId: String,
    val userName: String,
    val action: String,
    val resource: String,
    val resourceId: String? = null,
    val details: String,
    val timestamp: Date,
    val ipAddress: String,
    val userAgent: String? = null,
    val changes: Map<String, Any>? = null
)

enum class AuditAction {
    CREATE,
    READ,
    UPDATE,
    DELETE,
    LOGIN,
    LOGOUT,
    EXPORT,
    IMPORT,
    APPROVE,
    REJECT,
    ASSIGN,
    UNASSIGN
}

enum class AuditResource {
    USER,
    ORDER,
    PRODUCT,
    CUSTOMER,
    PAYMENT,
    INVOICE,
    INVENTORY,
    STAFF,
    SETTINGS,
    NOTIFICATION,
    SUPPORT_TICKET,
    WARRANTY_CLAIM,
    DISPUTE,
    EXPORT,
    AUDIT_LOG
}
