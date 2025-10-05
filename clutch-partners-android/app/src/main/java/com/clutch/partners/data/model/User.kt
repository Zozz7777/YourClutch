package com.clutch.partners.data.model

import java.util.Date

data class User(
    val id: String,
    val email: String,
    val phone: String,
    val partnerId: String,
    val businessName: String,
    val businessType: PartnerType,
    val role: UserRole,
    val isVerified: Boolean,
    val createdAt: Date,
    val lastLoginAt: Date?,
    val profileImage: String?,
    val address: String?,
    val taxId: String?
)

enum class PartnerType {
    REPAIR_CENTER,
    AUTO_PARTS,
    ACCESSORIES,
    IMPORTER,
    MANUFACTURER,
    SERVICE_CENTER
}

enum class UserRole {
    OWNER,
    MANAGER,
    STAFF,
    ACCOUNTANT,
    HR
}
