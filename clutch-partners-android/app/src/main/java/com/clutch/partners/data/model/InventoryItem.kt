package com.clutch.partners.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import java.util.Date

@Parcelize
data class InventoryItem(
    val id: String,
    val sku: String,
    val name: String,
    val description: String?,
    val category: String,
    val price: Double,
    val cost: Double,
    val stock: Int,
    val minStock: Int,
    val maxStock: Int?,
    val status: ItemStatus,
    val isLowStock: Boolean,
    val isOutOfStock: Boolean,
    val lastUpdated: Date,
    val image: String?
) : Parcelable

enum class ItemStatus {
    ACTIVE,
    INACTIVE,
    DISCONTINUED
}

@Parcelize
data class InventoryRequest(
    val name: String,
    val sku: String?,
    val description: String?,
    val category: String,
    val price: Double,
    val cost: Double?,
    val stock: Int,
    val minStock: Int = 5,
    val maxStock: Int?,
    val image: String?
) : Parcelable

@Parcelize
data class InventoryUpdate(
    val name: String?,
    val description: String?,
    val category: String?,
    val price: Double?,
    val cost: Double?,
    val stock: Int?,
    val minStock: Int?,
    val maxStock: Int?,
    val status: ItemStatus?,
    val image: String?
) : Parcelable

@Parcelize
data class InventoryResponse(
    val inventory: List<InventoryItem>,
    val pagination: Pagination
) : Parcelable

@Parcelize
data class InventoryFilter(
    val category: String?,
    val status: ItemStatus?,
    val search: String?
) : Parcelable
