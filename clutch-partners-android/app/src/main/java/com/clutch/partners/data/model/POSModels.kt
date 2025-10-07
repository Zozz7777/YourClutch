package com.clutch.partners.data.model

// Data classes for POS API requests
data class POSSale(
    val items: List<POSItem>,
    val customerName: String?,
    val customerPhone: String?,
    val customerEmail: String?,
    val paymentMethod: String,
    val discount: Double,
    val notes: String?
)

data class POSItem(
    val sku: String,
    val quantity: Int,
    val price: Double
)
