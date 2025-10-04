package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class Car(
    @SerializedName("_id") val id: String,
    @SerializedName("userId") val userId: String,
    @SerializedName("year") val year: Int,
    @SerializedName("brand") val brand: String,
    @SerializedName("model") val model: String,
    @SerializedName("trim") val trim: String,
    @SerializedName("kilometers") val kilometers: Int,
    @SerializedName("color") val color: String,
    @SerializedName("licensePlate") val licensePlate: String,
    @SerializedName("currentMileage") val currentMileage: Int,
    @SerializedName("lastMaintenanceDate") val lastMaintenanceDate: String? = null,
    @SerializedName("lastMaintenanceKilometers") val lastMaintenanceKilometers: Int = 0,
    @SerializedName("lastMaintenanceServices") val lastMaintenanceServices: List<MaintenanceServiceItem> = emptyList(),
    @SerializedName("isActive") val isActive: Boolean = true,
    @SerializedName("createdAt") val createdAt: String,
    @SerializedName("updatedAt") val updatedAt: String
)

data class MaintenanceServiceItem(
    @SerializedName("serviceGroup") val serviceGroup: String,
    @SerializedName("serviceName") val serviceName: String,
    @SerializedName("date") val date: String
)

data class CarHealth(
    @SerializedName("carId") val carId: String,
    @SerializedName("overallScore") val overallScore: Int, // 0-100
    @SerializedName("battery") val battery: HealthMetric,
    @SerializedName("engine") val engine: HealthMetric,
    @SerializedName("tires") val tires: HealthMetric,
    @SerializedName("fluids") val fluids: HealthMetric,
    @SerializedName("brakes") val brakes: HealthMetric,
    @SerializedName("lastUpdated") val lastUpdated: String
)

data class HealthMetric(
    @SerializedName("score") val score: Int, // 0-100
    @SerializedName("status") val status: String, // "Good", "Warning", "Critical"
    @SerializedName("message") val message: String,
    @SerializedName("lastChecked") val lastChecked: String
)


data class MaintenanceReminder(
    @SerializedName("_id") val id: String,
    @SerializedName("carId") val carId: String,
    @SerializedName("type") val type: String,
    @SerializedName("dueDate") val dueDate: String,
    @SerializedName("dueMileage") val dueMileage: Int?,
    @SerializedName("isOverdue") val isOverdue: Boolean,
    @SerializedName("priority") val priority: String // "Low", "Medium", "High", "Critical"
)
