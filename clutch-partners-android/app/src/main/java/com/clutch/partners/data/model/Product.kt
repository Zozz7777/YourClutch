package com.clutch.partners.data.model

data class Product(
    val id: String,
    val sku: String,
    val name: String,
    val description: String,
    val category: String,
    val price: Double,
    val cost: Double,
    val stock: Int,
    val minStock: Int,
    val maxStock: Int = 1000,
    val barcode: String? = null,
    val imageUrl: String? = null,
    val isActive: Boolean = true,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
) {
    val isLowStock: Boolean get() = stock <= minStock
    val isOutOfStock: Boolean get() = stock <= 0
    val stockStatus: StockStatus get() = when {
        isOutOfStock -> StockStatus.OUT_OF_STOCK
        isLowStock -> StockStatus.LOW_STOCK
        else -> StockStatus.IN_STOCK
    }
}

enum class StockStatus {
    IN_STOCK,
    LOW_STOCK,
    OUT_OF_STOCK
}

data class CartItem(
    val product: Product,
    val quantity: Int,
    val discount: Double = 0.0,
    val notes: String? = null
) {
    val subtotal: Double get() = (product.price * quantity) - discount
    val totalDiscount: Double get() = discount
}

data class Sale(
    val id: String,
    val items: List<CartItem>,
    val subtotal: Double,
    val tax: Double,
    val discount: Double,
    val total: Double,
    val paymentMethod: PaymentMethod,
    val customerId: String? = null,
    val cashierId: String,
    val createdAt: Long = System.currentTimeMillis(),
    val status: SaleStatus = SaleStatus.COMPLETED
) {
    val itemCount: Int get() = items.sumOf { it.quantity }
    val profit: Double get() = items.sumOf { (it.product.price - it.product.cost) * it.quantity }
}

enum class PaymentMethod {
    CASH,
    CARD,
    WALLET,
    INSTAPAY,
    INSTALLMENTS
}

enum class SaleStatus {
    PENDING,
    COMPLETED,
    CANCELLED,
    REFUNDED
}

data class Customer(
    val id: String,
    val name: String,
    val phone: String,
    val email: String? = null,
    val address: String? = null,
    val loyaltyPoints: Int = 0,
    val totalSpent: Double = 0.0,
    val lastVisit: Long? = null,
    val createdAt: Long = System.currentTimeMillis()
)