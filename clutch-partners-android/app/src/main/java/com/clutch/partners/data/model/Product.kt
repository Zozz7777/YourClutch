package com.clutch.partners.data.model

import java.util.Date

data class Product(
    val id: String,
    val name: String,
    val description: String,
    val category: String,
    val brand: String,
    val sku: String,
    val price: Double,
    val cost: Double,
    val stockQuantity: Int,
    val minStockLevel: Int,
    val images: List<String>,
    val isActive: Boolean,
    val createdAt: Date,
    val updatedAt: Date
)
