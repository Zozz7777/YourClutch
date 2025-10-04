package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class LoyaltyPoints(
    @SerializedName("userId")
    val userId: String,
    @SerializedName("totalPoints")
    val totalPoints: Int,
    @SerializedName("availablePoints")
    val availablePoints: Int,
    @SerializedName("lifetimePoints")
    val lifetimePoints: Int,
    @SerializedName("tier")
    val tier: String,
    @SerializedName("nextTierPoints")
    val nextTierPoints: Int,
    @SerializedName("pointsHistory")
    val pointsHistory: List<PointsTransaction>
)

data class PointsTransaction(
    @SerializedName("id")
    val id: String,
    @SerializedName("points")
    val points: Int,
    @SerializedName("type")
    val type: String, // earned, redeemed, expired
    @SerializedName("description")
    val description: String,
    @SerializedName("date")
    val date: String,
    @SerializedName("expiryDate")
    val expiryDate: String?
)

data class Reward(
    @SerializedName("id")
    val id: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("description")
    val description: String,
    @SerializedName("pointsRequired")
    val pointsRequired: Int,
    @SerializedName("category")
    val category: String,
    @SerializedName("icon")
    val icon: String,
    @SerializedName("isAvailable")
    val isAvailable: Boolean,
    @SerializedName("expiryDate")
    val expiryDate: String?,
    @SerializedName("termsAndConditions")
    val termsAndConditions: String
)

data class RewardRedemption(
    @SerializedName("id")
    val id: String,
    @SerializedName("userId")
    val userId: String,
    @SerializedName("rewardId")
    val rewardId: String,
    @SerializedName("pointsUsed")
    val pointsUsed: Int,
    @SerializedName("status")
    val status: String, // pending, confirmed, expired, used
    @SerializedName("redemptionDate")
    val redemptionDate: String,
    @SerializedName("expiryDate")
    val expiryDate: String,
    @SerializedName("redemptionCode")
    val redemptionCode: String?
)

data class RedemptionRequest(
    @SerializedName("rewardId")
    val rewardId: String,
    @SerializedName("pointsUsed")
    val pointsUsed: Int
)

data class RedemptionResponse(
    @SerializedName("success")
    val success: Boolean,
    @SerializedName("redemptionId")
    val redemptionId: String?,
    @SerializedName("redemptionCode")
    val redemptionCode: String?,
    @SerializedName("message")
    val message: String
)

data class Badge(
    @SerializedName("id")
    val id: String,
    @SerializedName("name")
    val name: String,
    @SerializedName("description")
    val description: String,
    @SerializedName("icon")
    val icon: String,
    @SerializedName("isEarned")
    val isEarned: Boolean,
    @SerializedName("earnedDate")
    val earnedDate: String?,
    @SerializedName("pointsAwarded")
    val pointsAwarded: Int
)

data class LoyaltyTier(
    @SerializedName("name")
    val name: String,
    @SerializedName("pointsRequired")
    val pointsRequired: Int,
    @SerializedName("benefits")
    val benefits: List<String>,
    @SerializedName("color")
    val color: String
)
