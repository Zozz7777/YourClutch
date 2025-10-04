package com.clutch.app.data.model

data class MaintenanceRecord(
    val id: String,
    val userId: String,
    val date: String,
    val maintenanceType: String,
    val kilometers: Int,
    val description: String? = null,
    val createdAt: String
)

data class MaintenanceRecordRequest(
    val date: String,
    val maintenanceType: String,
    val kilometers: Int,
    val description: String? = null
)
