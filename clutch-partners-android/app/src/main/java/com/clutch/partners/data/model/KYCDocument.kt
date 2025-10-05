package com.clutch.partners.data.model

import java.util.Date

data class KYCDocument(
    val id: String,
    val userId: String,
    val documentType: DocumentType,
    val fileUrl: String,
    val status: DocumentStatus,
    val uploadedAt: Date,
    val reviewedAt: Date?,
    val rejectionReason: String?
)

enum class DocumentType {
    BUSINESS_LICENSE,
    TAX_CERTIFICATE,
    TRADE_LICENSE,
    ID_CARD,
    PASSPORT,
    BANK_STATEMENT
}

enum class DocumentStatus {
    PENDING,
    APPROVED,
    REJECTED,
    UNDER_REVIEW
}
