package com.clutch.partners.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import java.util.Date

@Parcelize
data class StoreProfile(
    val businessName: String,
    val ownerName: String,
    val email: String,
    val phone: String,
    val partnerType: PartnerType,
    val businessAddress: BusinessAddress,
    val workingHours: WorkingHours,
    val businessSettings: BusinessSettings,
    val services: List<String>,
    val isConnectedToPOS: Boolean,
    val isVerified: Boolean,
    val status: PartnerStatus,
    val createdAt: Date
) : Parcelable

@Parcelize
data class BusinessAddress(
    val street: String,
    val city: String,
    val state: String,
    val zipCode: String,
    val country: String,
    val coordinates: Coordinates?
) : Parcelable

@Parcelize
data class Coordinates(
    val latitude: Double,
    val longitude: Double
) : Parcelable

@Parcelize
data class WorkingHours(
    val monday: DayHours,
    val tuesday: DayHours,
    val wednesday: DayHours,
    val thursday: DayHours,
    val friday: DayHours,
    val saturday: DayHours,
    val sunday: DayHours
) : Parcelable

@Parcelize
data class DayHours(
    val isOpen: Boolean,
    val openTime: String?,
    val closeTime: String?,
    val breakStart: String?,
    val breakEnd: String?
) : Parcelable

@Parcelize
data class BusinessSettings(
    val currency: String,
    val timezone: String,
    val language: String,
    val notificationPreferences: NotificationPreferences,
    val posSettings: POSSettings?
) : Parcelable

@Parcelize
data class NotificationPreferences(
    val pushNotifications: Boolean,
    val emailNotifications: Boolean,
    val smsNotifications: Boolean,
    val orderUpdates: Boolean,
    val paymentUpdates: Boolean,
    val systemUpdates: Boolean,
    val quietHours: QuietHours?
) : Parcelable

@Parcelize
data class QuietHours(
    val startTime: String,
    val endTime: String,
    val days: List<String>
) : Parcelable

@Parcelize
data class POSSettings(
    val isConnected: Boolean,
    val systemName: String?,
    val lastSync: Date?,
    val autoSync: Boolean
) : Parcelable

enum class PartnerType {
    REPAIR_CENTER,
    AUTO_PARTS_SHOP,
    ACCESSORIES_SHOP,
    IMPORTER_MANUFACTURER,
    SERVICE_CENTER
}

enum class PartnerStatus {
    ACTIVE,
    INACTIVE,
    SUSPENDED,
    PENDING_VERIFICATION
}

@Parcelize
data class StoreProfileUpdate(
    val businessName: String?,
    val ownerName: String?,
    val phone: String?,
    val email: String?,
    val businessAddress: BusinessAddress?,
    val workingHours: WorkingHours?,
    val businessSettings: BusinessSettings?,
    val services: List<String>?,
    val isConnectedToPOS: Boolean?
) : Parcelable

@Parcelize
data class WorkingHoursUpdate(
    val workingHours: WorkingHours
) : Parcelable

@Parcelize
data class ServicesUpdate(
    val services: List<String>
) : Parcelable
