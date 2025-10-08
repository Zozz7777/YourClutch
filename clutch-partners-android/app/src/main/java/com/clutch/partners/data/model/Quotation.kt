package com.clutch.partners.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import java.util.Date

@Parcelize
data class Quotation(
    val id: String,
    val quotationId: String,
    val customer: Customer,
    val service: String,
    val description: String?,
    val total: Double,
    val status: QuotationStatus,
    val validUntil: Date,
    val items: List<QuotationItem>,
    val createdAt: Date,
    val isExpired: Boolean = validUntil < Date()
) : Parcelable

@Parcelize
data class QuotationItem(
    val name: String,
    val description: String?,
    val quantity: Int,
    val unitPrice: Double,
    val total: Double
) : Parcelable

enum class QuotationStatus {
    PENDING,
    ACCEPTED,
    REJECTED,
    EXPIRED
}

@Parcelize
data class QuotationRequest(
    val customerName: String,
    val customerPhone: String,
    val customerEmail: String?,
    val serviceName: String,
    val description: String?,
    val total: Double,
    val validUntil: Date?,
    val items: List<QuotationItem>
) : Parcelable

@Parcelize
data class QuotationResponse(
    val quotations: List<Quotation>,
    val pagination: Pagination
) : Parcelable

@Parcelize
data class Pagination(
    val page: Int,
    val limit: Int,
    val total: Int,
    val pages: Int
) : Parcelable
