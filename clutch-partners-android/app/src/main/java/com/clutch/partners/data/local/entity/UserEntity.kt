package com.clutch.partners.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.clutch.partners.data.model.PartnerType
import com.clutch.partners.data.model.PartnerStatus

@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey
    val id: String,
    val email: String,
    val businessName: String,
    val phone: String,
    val partnerType: PartnerType,
    val status: PartnerStatus,
    val isVerified: Boolean,
    val createdAt: Long,
    val updatedAt: Long,
    val lastSyncAt: Long? = null
)

@Entity(tableName = "appointments")
data class AppointmentEntity(
    @PrimaryKey
    val id: String,
    val customerName: String,
    val customerPhone: String,
    val customerEmail: String?,
    val vehicleMake: String,
    val vehicleModel: String,
    val vehicleYear: Int,
    val serviceType: String,
    val scheduledDate: Long,
    val status: String,
    val priority: String,
    val notes: String?,
    val createdAt: Long,
    val updatedAt: Long,
    val lastSyncAt: Long? = null,
    val isPendingSync: Boolean = false
)

@Entity(tableName = "quotations")
data class QuotationEntity(
    @PrimaryKey
    val id: String,
    val customerName: String,
    val customerPhone: String,
    val customerEmail: String?,
    val vehicleMake: String,
    val vehicleModel: String,
    val vehicleYear: Int,
    val quoteNumber: String,
    val status: String,
    val subtotal: Double,
    val tax: Double,
    val discount: Double,
    val total: Double,
    val validUntil: Long,
    val notes: String?,
    val createdAt: Long,
    val updatedAt: Long,
    val lastSyncAt: Long? = null,
    val isPendingSync: Boolean = false
)

@Entity(tableName = "quotation_items")
data class QuotationItemEntity(
    @PrimaryKey
    val id: String,
    val quotationId: String,
    val itemName: String,
    val description: String?,
    val quantity: Int,
    val unitPrice: Double,
    val totalPrice: Double,
    val createdAt: Long,
    val lastSyncAt: Long? = null,
    val isPendingSync: Boolean = false
)

@Entity(tableName = "inventory_items")
data class InventoryItemEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val description: String?,
    val category: String,
    val sku: String,
    val barcode: String?,
    val price: Double,
    val cost: Double,
    val stock: Int,
    val minStock: Int,
    val maxStock: Int,
    val status: String,
    val imageUrl: String?,
    val createdAt: Long,
    val updatedAt: Long,
    val lastSyncAt: Long? = null,
    val isPendingSync: Boolean = false
)

@Entity(tableName = "orders")
data class OrderEntity(
    @PrimaryKey
    val id: String,
    val customerName: String,
    val customerPhone: String,
    val customerEmail: String?,
    val vehicleMake: String,
    val vehicleModel: String,
    val vehicleYear: Int,
    val serviceType: String,
    val status: String,
    val priority: String,
    val totalAmount: Double,
    val notes: String?,
    val createdAt: Long,
    val updatedAt: Long,
    val lastSyncAt: Long? = null,
    val isPendingSync: Boolean = false
)

@Entity(tableName = "store_profiles")
data class StoreProfileEntity(
    @PrimaryKey
    val id: String,
    val businessName: String,
    val businessType: String,
    val address: String,
    val city: String,
    val state: String,
    val zipCode: String,
    val country: String,
    val phone: String,
    val email: String,
    val website: String?,
    val description: String?,
    val isActive: Boolean,
    val createdAt: Long,
    val updatedAt: Long,
    val lastSyncAt: Long? = null,
    val isPendingSync: Boolean = false
)

@Entity(tableName = "working_hours")
data class WorkingHoursEntity(
    @PrimaryKey
    val id: String,
    val storeId: String,
    val dayOfWeek: Int, // 0 = Sunday, 1 = Monday, etc.
    val isOpen: Boolean,
    val openTime: String?,
    val closeTime: String?,
    val isBreakTime: Boolean = false,
    val breakStartTime: String? = null,
    val breakEndTime: String? = null,
    val createdAt: Long,
    val updatedAt: Long,
    val lastSyncAt: Long? = null,
    val isPendingSync: Boolean = false
)

@Entity(tableName = "sync_status")
data class SyncStatusEntity(
    @PrimaryKey
    val tableName: String,
    val lastSyncAt: Long,
    val isSyncing: Boolean = false,
    val pendingOperations: Int = 0
)
