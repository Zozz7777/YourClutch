package com.clutch.app.data.model

data class MaintenanceType(
    val id: String,
    val name: String,
    val description: String? = null,
    val category: String? = null,
    val isActive: Boolean = true
)
