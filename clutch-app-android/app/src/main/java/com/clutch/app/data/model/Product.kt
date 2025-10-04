package com.clutch.app.data.model

data class Product(
    val id: String,
    val name: String,
    val price: String,
    val originalPrice: String? = null,
    val image: Int,
    val rating: Float = 0f,
    val reviewCount: Int = 0,
    val isFavorite: Boolean = false,
    val isInCart: Boolean = false,
    val category: String = "",
    val description: String = "",
    val specifications: List<String> = emptyList(),
    val reviews: List<ProductReview> = emptyList()
)

data class ProductCategory(
    val id: String,
    val name: String,
    val icon: Int,
    val productCount: Int = 0
)

data class ProductReview(
    val id: String,
    val userName: String,
    val rating: Float,
    val comment: String,
    val date: String
)

data class CartItem(
    val productId: String,
    val name: String,
    val price: String,
    val quantity: Int,
    val image: Int
)

// E-commerce specific data classes with unique names to avoid conflicts
data class EcommerceOrderItem(
    val productId: String,
    val name: String,
    val price: String,
    val quantity: Int,
    val image: Int
)

data class EcommerceOrder(
    val id: String,
    val orderDate: String,
    val status: String,
    val total: String,
    val items: List<EcommerceOrderItem>
)

data class WishlistItem(
    val id: String,
    val name: String,
    val price: String,
    val image: Int,
    val addedDate: String
)

data class EcommercePaymentMethod(
    val id: String,
    val name: String,
    val description: String,
    val icon: Int
)

data class CheckoutOrderItem(
    val name: String,
    val quantity: Int,
    val price: String,
    val image: Int
)

data class Address(
    val id: String,
    val name: String,
    val address: String,
    val phone: String,
    val isDefault: Boolean = false
)
