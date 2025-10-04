package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class User(
    @SerializedName("_id") val id: String,
    @SerializedName("email") val email: String,
    @SerializedName("phone") val phone: String?,
    @SerializedName("firstName") val firstName: String,
    @SerializedName("lastName") val lastName: String,
    @SerializedName("dateOfBirth") val dateOfBirth: String?,
    @SerializedName("gender") val gender: String?,
    @SerializedName("profileImage") val profileImage: String?,
    @SerializedName("isEmailVerified") val isEmailVerified: Boolean,
    @SerializedName("isPhoneVerified") val isPhoneVerified: Boolean,
    @SerializedName("preferences") val preferences: UserPreferences,
    @SerializedName("createdAt") val createdAt: String,
    @SerializedName("updatedAt") val updatedAt: String
)

data class UserPreferences(
    @SerializedName("language") val language: String = "en",
    @SerializedName("theme") val theme: String = "light",
    @SerializedName("notifications") val notifications: NotificationPreferences,
    @SerializedName("receiveOffers") val receiveOffers: Boolean = true,
    @SerializedName("subscribeNewsletter") val subscribeNewsletter: Boolean = true
)

data class NotificationPreferences(
    @SerializedName("push") val push: Boolean = true,
    @SerializedName("email") val email: Boolean = true,
    @SerializedName("sms") val sms: Boolean = false
)

data class ForgotPasswordRequest(
    @SerializedName("emailOrPhone") val emailOrPhone: String
)

data class OtpRequest(
    @SerializedName("emailOrPhone") val emailOrPhone: String,
    @SerializedName("otp") val otp: String
)
