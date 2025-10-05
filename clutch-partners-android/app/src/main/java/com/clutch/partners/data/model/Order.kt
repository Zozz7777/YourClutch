package com.clutch.partners.data.model

import java.util.Date

data class Order(
    val id: String,
    val customerId: String,
    val customerName: String,
    val items: List<OrderItem>,
    val totalAmount: Double,
    val status: OrderStatus,
    val paymentStatus: PaymentStatus,
    val createdAt: Date,
    val updatedAt: Date,
    val notes: String?
)

data class OrderItem(
    val productId: String,
    val productName: String,
    val quantity: Int,
    val unitPrice: Double,
    val totalPrice: Double
)

enum class OrderStatus {
    PENDING,
    CONFIRMED,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}

enum class PaymentStatus {
    PENDING,
    PAID,
    PARTIALLY_PAID,
    REFUNDED
}
