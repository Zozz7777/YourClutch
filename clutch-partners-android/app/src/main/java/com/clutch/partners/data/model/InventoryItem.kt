package com.clutch.partners.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "inventory_items")
data class InventoryItem(
    @PrimaryKey
    val id: String,
    val name: String,
    val description: String? = null,
    val sku: String,
    val price: Double,
    val stock: Int,
    val category: String? = null,
    val brand: String? = null,
    val imageUrl: String? = null,
    val lowStockThreshold: Int = 10,
    val isActive: Boolean = true,
    val createdAt: Date = Date(),
    val updatedAt: Date = Date()
)

enum class InventoryFilter {
    ALL, LOW_STOCK, OUT_OF_STOCK, ACTIVE, INACTIVE
}

enum class StockFilter {
    ALL, IN_STOCK, LOW_STOCK, OUT_OF_STOCK
}

enum class SortBy {
    NAME, PRICE, STOCK, CREATED_DATE, UPDATED_DATE
}
