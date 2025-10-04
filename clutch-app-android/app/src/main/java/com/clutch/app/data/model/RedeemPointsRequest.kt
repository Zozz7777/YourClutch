package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class RedeemPointsRequest(
    @SerializedName("points")
    val points: Int,
    @SerializedName("rewardId")
    val rewardId: String,
    @SerializedName("description")
    val description: String
)
