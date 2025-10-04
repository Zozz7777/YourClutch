package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class ServiceBookingRequest(
    @SerializedName("serviceCategoryId")
    val serviceCategoryId: String,
    @SerializedName("serviceProviderId")
    val serviceProviderId: String,
    @SerializedName("scheduledDate")
    val scheduledDate: String,
    @SerializedName("scheduledTime")
    val scheduledTime: String,
    @SerializedName("notes")
    val notes: String? = null
)
