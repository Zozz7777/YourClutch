package com.clutch.app.data.model

import com.google.gson.annotations.SerializedName

data class ApiResponse<T>(
    @SerializedName("success")
    val success: Boolean,
    @SerializedName("data")
    val data: T?,
    @SerializedName("message")
    val message: String?,
    @SerializedName("errors")
    val errors: List<String>? = null,
    @SerializedName("timestamp")
    val timestamp: String? = null
)

// Non-generic version for backward compatibility
data class ApiResponseSimple(
    @SerializedName("success")
    val success: Boolean,
    @SerializedName("data")
    val data: Any?,
    @SerializedName("message")
    val message: String?,
    @SerializedName("errors")
    val errors: List<String>? = null,
    @SerializedName("timestamp")
    val timestamp: String? = null
)

data class ApiError(
    @SerializedName("code")
    val code: Int,
    @SerializedName("message")
    val message: String,
    @SerializedName("details")
    val details: String? = null,
    @SerializedName("field")
    val field: String? = null
)

data class PaginatedResponse<T>(
    @SerializedName("data")
    val data: List<T>,
    @SerializedName("pagination")
    val pagination: Pagination
)

data class Pagination(
    @SerializedName("currentPage")
    val currentPage: Int,
    @SerializedName("totalPages")
    val totalPages: Int,
    @SerializedName("totalItems")
    val totalItems: Int,
    @SerializedName("itemsPerPage")
    val itemsPerPage: Int,
    @SerializedName("hasNext")
    val hasNext: Boolean,
    @SerializedName("hasPrevious")
    val hasPrevious: Boolean
)