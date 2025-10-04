package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class EarnPointsRequest(
    @SerializedName("points")
    val points: Int,
    @SerializedName("type")
    val type: String,
    @SerializedName("description")
    val description: String,
    @SerializedName("source")
    val source: String
)
