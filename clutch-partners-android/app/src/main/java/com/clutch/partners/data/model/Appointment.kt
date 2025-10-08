package com.clutch.partners.data.model

import android.os.Parcelable
import kotlinx.parcelize.Parcelize
import java.util.Date

@Parcelize
data class Appointment(
    val id: String,
    val appointmentId: String,
    val customer: Customer,
    val vehicle: Vehicle,
    val service: String,
    val description: String?,
    val scheduledDate: Date,
    val estimatedTime: String?,
    val status: AppointmentStatus,
    val priority: Priority,
    val notes: String?,
    val createdAt: Date,
    val updatedAt: Date?,
    val isUrgent: Boolean = priority == Priority.HIGH
) : Parcelable

@Parcelize
data class Customer(
    val name: String,
    val phone: String,
    val email: String?
) : Parcelable

@Parcelize
data class Vehicle(
    val make: String?,
    val model: String?,
    val year: Int?,
    val plate: String?
) : Parcelable

enum class AppointmentStatus {
    SCHEDULED,
    CONFIRMED,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}

enum class Priority {
    LOW,
    NORMAL,
    HIGH
}

@Parcelize
data class AppointmentRequest(
    val customerName: String,
    val customerPhone: String,
    val customerEmail: String?,
    val serviceName: String,
    val description: String?,
    val scheduledDate: Date,
    val estimatedTime: String?,
    val vehicleMake: String?,
    val vehicleModel: String?,
    val vehicleYear: Int?,
    val vehiclePlate: String?,
    val priority: Priority = Priority.NORMAL
) : Parcelable

@Parcelize
data class AppointmentUpdate(
    val status: AppointmentStatus,
    val notes: String?,
    val estimatedTime: String?
) : Parcelable

@Parcelize
data class AppointmentResponse(
    val appointments: List<Appointment>,
    val pagination: Pagination
) : Parcelable
