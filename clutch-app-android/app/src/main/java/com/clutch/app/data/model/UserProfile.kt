package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class UserProfile(
    @SerializedName("id")
    val id: String,
    @SerializedName("email")
    val email: String,
    @SerializedName("firstName")
    val firstName: String,
    @SerializedName("lastName")
    val lastName: String,
    @SerializedName("phoneNumber")
    val phoneNumber: String? = null,
    @SerializedName("dateOfBirth")
    val dateOfBirth: String? = null,
    @SerializedName("avatar")
    val avatar: String? = null,
    @SerializedName("isEmailVerified")
    val isEmailVerified: Boolean = false,
    @SerializedName("isPhoneVerified")
    val isPhoneVerified: Boolean = false,
    @SerializedName("preferences")
    val preferences: UserPreferences? = null,
    @SerializedName("createdAt")
    val createdAt: String,
    @SerializedName("updatedAt")
    val updatedAt: String
)

// UserPreferences is defined in User.kt

data class PrivacySettings(
    @SerializedName("profileVisibility")
    val profileVisibility: String = "private", // "public", "private", "friends"
    @SerializedName("showEmail")
    val showEmail: Boolean = false,
    @SerializedName("showPhone")
    val showPhone: Boolean = false,
    @SerializedName("showLocation")
    val showLocation: Boolean = false
)

// Extension function to convert UserProfile to User
fun UserProfile.toUser(): User {
    return User(
        id = this.id,
        email = this.email,
        phone = this.phoneNumber,
        firstName = this.firstName,
        lastName = this.lastName,
        dateOfBirth = this.dateOfBirth,
        gender = null,
        profileImage = this.avatar,
        isEmailVerified = this.isEmailVerified,
        isPhoneVerified = this.isPhoneVerified,
        preferences = UserPreferences(
            language = this.preferences?.language ?: "en",
            theme = this.preferences?.theme ?: "light",
            notifications = NotificationPreferences(),
            receiveOffers = true,
            subscribeNewsletter = true
        ),
        createdAt = this.createdAt,
        updatedAt = this.updatedAt
    )
}
