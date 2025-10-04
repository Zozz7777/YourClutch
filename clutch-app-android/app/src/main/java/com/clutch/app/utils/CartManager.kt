package com.clutch.app.utils

import android.content.Context
import androidx.compose.runtime.*

object CartManager {
    private const val PREF_CART_ITEMS = "cart_items"
    private const val PREF_CART_COUNT = "cart_count"
    
    private var _cartItems by mutableStateOf<List<CartItem>>(emptyList())
    private var _cartCount by mutableStateOf(0)
    
    val cartItems: List<CartItem> get() = _cartItems
    val cartCount: Int get() = _cartCount
    
    data class CartItem(
        val id: String,
        val name: String,
        val price: Double,
        val quantity: Int,
        val imageUrl: String? = null,
        val category: String? = null,
        val brand: String? = null
    )
    
    fun initialize(context: Context) {
        // Simplified initialization without preferences for now
        _cartCount = 0
        _cartItems = emptyList()
    }
    
    fun addToCart(item: CartItem, context: Context) {
        val existingItemIndex = _cartItems.indexOfFirst { it.id == item.id }
        
        if (existingItemIndex >= 0) {
            // Update quantity of existing item
            val updatedItems = _cartItems.toMutableList()
            val existingItem = updatedItems[existingItemIndex]
            updatedItems[existingItemIndex] = existingItem.copy(
                quantity = existingItem.quantity + item.quantity
            )
            _cartItems = updatedItems
        } else {
            // Add new item
            _cartItems = _cartItems + item
        }
        
        updateCartCount(context)
    }
    
    fun removeFromCart(itemId: String, context: Context) {
        _cartItems = _cartItems.filter { it.id != itemId }
        updateCartCount(context)
    }
    
    fun updateQuantity(itemId: String, newQuantity: Int, context: Context) {
        if (newQuantity <= 0) {
            removeFromCart(itemId, context)
        } else {
            val updatedItems = _cartItems.map { item ->
                if (item.id == itemId) {
                    item.copy(quantity = newQuantity)
                } else {
                    item
                }
            }
            _cartItems = updatedItems
            updateCartCount(context)
        }
    }
    
    fun clearCart(context: Context) {
        _cartItems = emptyList()
        updateCartCount(context)
    }
    
    private fun updateCartCount(context: Context) {
        _cartCount = _cartItems.sumOf { it.quantity }
        // Simplified - no persistence for now
    }
    
    fun getTotalPrice(): Double {
        return _cartItems.sumOf { it.price * it.quantity }
    }
}
