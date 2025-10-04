package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class LoginRequest(
    @SerializedName("email")
    val email: String, // Can be email or phone number
    
    @SerializedName("password")
    val password: String,
    
    @SerializedName("rememberMe")
    val rememberMe: Boolean = false
)
