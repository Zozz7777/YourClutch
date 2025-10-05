package com.clutch.partners.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.partners.data.model.*
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class POSViewModel @Inject constructor() : ViewModel() {
    
    private val _cart = MutableStateFlow<List<CartItem>>(emptyList())
    val cart: StateFlow<List<CartItem>> = _cart.asStateFlow()
    
    private val _products = MutableStateFlow<List<Product>>(emptyList())
    val products: StateFlow<List<Product>> = _products.asStateFlow()
    
    private val _sales = MutableStateFlow<List<Sale>>(emptyList())
    val sales: StateFlow<List<Sale>> = _sales.asStateFlow()
    
    private val _customers = MutableStateFlow<List<Customer>>(emptyList())
    val customers: StateFlow<List<Customer>> = _customers.asStateFlow()
    
    private val _selectedCustomer = MutableStateFlow<Customer?>(null)
    val selectedCustomer: StateFlow<Customer?> = _selectedCustomer.asStateFlow()
    
    init {
        loadProducts()
        loadCustomers()
    }
    
    fun addToCart(product: Product, quantity: Int = 1) {
        viewModelScope.launch {
            val currentCart = _cart.value.toMutableList()
            val existingItemIndex = currentCart.indexOfFirst { it.product.id == product.id }
            
            if (existingItemIndex != -1) {
                val existingItem = currentCart[existingItemIndex]
                currentCart[existingItemIndex] = existingItem.copy(quantity = existingItem.quantity + quantity)
            } else {
                currentCart.add(CartItem(product = product, quantity = quantity))
            }
            
            _cart.value = currentCart
        }
    }
    
    fun updateCartItemQuantity(productId: String, quantity: Int) {
        viewModelScope.launch {
            val currentCart = _cart.value.toMutableList()
            val itemIndex = currentCart.indexOfFirst { it.product.id == productId }
            
            if (itemIndex != -1) {
                if (quantity <= 0) {
                    currentCart.removeAt(itemIndex)
                } else {
                    currentCart[itemIndex] = currentCart[itemIndex].copy(quantity = quantity)
                }
                _cart.value = currentCart
            }
        }
    }
    
    fun removeFromCart(productId: String) {
        viewModelScope.launch {
            _cart.value = _cart.value.filter { it.product.id != productId }
        }
    }
    
    fun clearCart() {
        viewModelScope.launch {
            _cart.value = emptyList()
        }
    }
    
    fun selectCustomer(customer: Customer?) {
        _selectedCustomer.value = customer
    }
    
    fun processSale(paymentMethod: PaymentMethod, cashierId: String): Result<Sale> {
        return try {
            val cartItems = _cart.value
            if (cartItems.isEmpty()) {
                return Result.failure(Exception("Cart is empty"))
            }
            
            val subtotal = cartItems.sumOf { it.subtotal }
            val tax = subtotal * 0.15 // 15% tax
            val discount = cartItems.sumOf { it.discount }
            val total = subtotal + tax - discount
            
            val sale = Sale(
                id = generateSaleId(),
                items = cartItems,
                subtotal = subtotal,
                tax = tax,
                discount = discount,
                total = total,
                paymentMethod = paymentMethod,
                customerId = _selectedCustomer.value?.id,
                cashierId = cashierId
            )
            
            _sales.value = _sales.value + sale
            _cart.value = emptyList()
            _selectedCustomer.value = null
            
            Result.success(sale)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun getCartTotal(): Double {
        return _cart.value.sumOf { it.subtotal }
    }
    
    fun getCartItemCount(): Int {
        return _cart.value.sumOf { it.quantity }
    }
    
    fun searchProducts(query: String) {
        viewModelScope.launch {
            // In real app, this would call API
            val filteredProducts = if (query.isEmpty()) {
                _products.value
            } else {
                _products.value.filter { 
                    it.name.contains(query, ignoreCase = true) ||
                    it.sku.contains(query, ignoreCase = true) ||
                    it.barcode == query
                }
            }
            _products.value = filteredProducts
        }
    }
    
    fun filterProductsByCategory(category: String) {
        viewModelScope.launch {
            // In real app, this would call API
            val filteredProducts = if (category == "all") {
                _products.value
            } else {
                _products.value.filter { it.category == category }
            }
            _products.value = filteredProducts
        }
    }
    
    private fun loadProducts() {
        viewModelScope.launch {
            // In real app, this would call API
            _products.value = listOf(
                Product(
                    id = "1",
                    sku = "BRK001",
                    name = "Brake Pads - Front",
                    description = "High-quality brake pads for front wheels",
                    category = "brakes",
                    price = 150.0,
                    cost = 100.0,
                    stock = 25,
                    minStock = 5,
                    maxStock = 100,
                    barcode = "1234567890123"
                ),
                Product(
                    id = "2",
                    sku = "ENG001",
                    name = "Engine Oil 5W-30",
                    description = "Synthetic engine oil 5W-30 grade",
                    category = "engine",
                    price = 80.0,
                    cost = 50.0,
                    stock = 50,
                    minStock = 10,
                    maxStock = 200,
                    barcode = "1234567890124"
                ),
                Product(
                    id = "3",
                    sku = "ELC001",
                    name = "Spark Plugs Set",
                    description = "Set of 4 spark plugs",
                    category = "electrical",
                    price = 120.0,
                    cost = 80.0,
                    stock = 3,
                    minStock = 5,
                    maxStock = 50,
                    barcode = "1234567890125"
                )
            )
        }
    }
    
    private fun loadCustomers() {
        viewModelScope.launch {
            // In real app, this would call API
            _customers.value = listOf(
                Customer(
                    id = "1",
                    name = "Ahmed Hassan",
                    phone = "+201234567890",
                    email = "ahmed@example.com",
                    loyaltyPoints = 150,
                    totalSpent = 2500.0
                ),
                Customer(
                    id = "2",
                    name = "Sara Mohamed",
                    phone = "+201234567891",
                    email = "sara@example.com",
                    loyaltyPoints = 75,
                    totalSpent = 1200.0
                )
            )
        }
    }
    
    private fun generateSaleId(): String {
        return "SALE-${System.currentTimeMillis()}"
    }
}
