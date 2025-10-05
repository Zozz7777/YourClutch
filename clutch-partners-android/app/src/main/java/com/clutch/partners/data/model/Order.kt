package com.clutch.partners.data.model

data class Order(
    val id: String,
    val customerName: String,
    val customerPhone: String,
    val totalAmount: Double,
    val status: String,
    val createdAt: Long,
    val items: List<OrderItem> = emptyList()
) : com.clutch.partners.offline.SyncableData

data class OrderItem(
    val id: String,
    val name: String,
    val quantity: Int,
    val price: Double
)