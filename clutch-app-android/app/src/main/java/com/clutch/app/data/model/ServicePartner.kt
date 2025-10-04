package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class ServicePartner(
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
    val distance: Double,
    @SerializedName("phoneNumber")
    val phoneNumber: String,
    @SerializedName("isAvailable")
    val isAvailable: Boolean,
    @SerializedName("specialties")
    val specialties: List<String>,
    @SerializedName("workingHours")
    val workingHours: WorkingHours
)
