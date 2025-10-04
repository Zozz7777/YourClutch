package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class ServiceCategory(
    @SerializedName("id")
    val id: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("description")
    val description: String,
    @SerializedName("basePrice")
    val basePrice: Double,
    @SerializedName("icon")
    val icon: String,
    @SerializedName("estimatedDuration")
    val estimatedDuration: Int, // in minutes
    @SerializedName("isAvailable")
    val isAvailable: Boolean = true
)

data class ServiceProvider(
    @SerializedName("id")
    val id: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("rating")
    val rating: Double,
    @SerializedName("reviewCount")
    val reviewCount: Int,
    @SerializedName("location")
    val location: String,
    @SerializedName("distance")
    val distance: Double, // in km
    @SerializedName("phoneNumber")
    val phoneNumber: String,
    @SerializedName("isAvailable")
    val isAvailable: Boolean = true,
    @SerializedName("specialties")
    val specialties: List<String> = emptyList(),
    @SerializedName("workingHours")
    val workingHours: WorkingHours
)

data class WorkingHours(
    @SerializedName("monday")
    val monday: DaySchedule,
    @SerializedName("tuesday")
    val tuesday: DaySchedule,
    @SerializedName("wednesday")
    val wednesday: DaySchedule,
    @SerializedName("thursday")
    val thursday: DaySchedule,
    @SerializedName("friday")
    val friday: DaySchedule,
    @SerializedName("saturday")
    val saturday: DaySchedule,
    @SerializedName("sunday")
    val sunday: DaySchedule
)

data class DaySchedule(
    @SerializedName("isOpen")
    val isOpen: Boolean,
    @SerializedName("openTime")
    val openTime: String?,
    @SerializedName("closeTime")
    val closeTime: String?
)

data class ServiceBooking(
    @SerializedName("id")
    val id: String,
    @SerializedName("userId")
    val userId: String,
    @SerializedName("serviceCategoryId")
    val serviceCategoryId: String,
    @SerializedName("serviceProviderId")
    val serviceProviderId: String,
    @SerializedName("scheduledDate")
    val scheduledDate: String,
    @SerializedName("scheduledTime")
    val scheduledTime: String,
    @SerializedName("notes")
    val notes: String,
    @SerializedName("status")
    val status: String, // pending, confirmed, in_progress, completed, cancelled
    @SerializedName("totalPrice")
    val totalPrice: Double,
    @SerializedName("createdAt")
    val createdAt: String? = null,
    @SerializedName("updatedAt")
    val updatedAt: String? = null
)

data class BookingRequest(
    @SerializedName("serviceCategoryId")
    val serviceCategoryId: String,
    @SerializedName("serviceProviderId")
    val serviceProviderId: String,
    @SerializedName("scheduledDate")
    val scheduledDate: String,
    @SerializedName("scheduledTime")
    val scheduledTime: String,
    @SerializedName("notes")
    val notes: String
)

data class BookingResponse(
    @SerializedName("success")
    val success: Boolean,
    @SerializedName("bookingId")
    val bookingId: String?,
    @SerializedName("message")
    val message: String
)

data class AvailableTimeSlot(
    @SerializedName("time")
    val time: String,
    @SerializedName("isAvailable")
    val isAvailable: Boolean
)

data class ServiceProviderAvailability(
    @SerializedName("providerId")
    val providerId: String,
    @SerializedName("date")
    val date: String,
    @SerializedName("availableSlots")
    val availableSlots: List<AvailableTimeSlot>
)
