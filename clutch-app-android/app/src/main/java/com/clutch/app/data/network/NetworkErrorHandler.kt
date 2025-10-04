package com.clutch.app.data.network

import android.util.Log
import com.clutch.app.data.model.ApiError
import com.clutch.app.utils.SessionManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import retrofit2.HttpException
import java.io.IOException
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NetworkErrorHandler @Inject constructor(
    private val sessionManager: SessionManager
) {
    
    private val _networkError = MutableStateFlow<NetworkError?>(null)
    val networkError: StateFlow<NetworkError?> = _networkError.asStateFlow()
    
    companion object {
        private const val TAG = "NetworkErrorHandler"
    }
    
    fun handleError(throwable: Throwable): NetworkError {
        val error = when (throwable) {
            is HttpException -> handleHttpException(throwable)
            is SocketTimeoutException -> NetworkError.Timeout("Request timed out")
            is UnknownHostException -> NetworkError.NoConnection("No internet connection")
            is IOException -> NetworkError.NoConnection("Network error: ${throwable.message}")
            else -> NetworkError.Unknown("Unknown error: ${throwable.message}")
        }
        
        _networkError.value = error
        Log.e(TAG, "Network error: ${error.message}", throwable)
        
        return error
    }
    
    private fun handleHttpException(exception: HttpException): NetworkError {
        return when (exception.code()) {
            401 -> {
                // Token expired, clear session
                sessionManager.clearSession()
                NetworkError.Unauthorized("Session expired. Please login again.")
            }
            403 -> NetworkError.Forbidden("Access denied")
            404 -> NetworkError.NotFound("Resource not found")
            422 -> NetworkError.Validation("Validation error")
            429 -> NetworkError.RateLimit("Too many requests. Please try again later.")
            500 -> NetworkError.ServerError("Server error. Please try again later.")
            502, 503, 504 -> NetworkError.ServerError("Service temporarily unavailable")
            else -> NetworkError.HttpError("HTTP ${exception.code()}: ${exception.message()}")
        }
    }
    
    fun clearError() {
        _networkError.value = null
    }
}

sealed class NetworkError(val message: String) {
    class NoConnection(message: String) : NetworkError(message)
    class Timeout(message: String) : NetworkError(message)
    class Unauthorized(message: String) : NetworkError(message)
    class Forbidden(message: String) : NetworkError(message)
    class NotFound(message: String) : NetworkError(message)
    class Validation(message: String) : NetworkError(message)
    class RateLimit(message: String) : NetworkError(message)
    class ServerError(message: String) : NetworkError(message)
    class HttpError(message: String) : NetworkError(message)
    class Unknown(message: String) : NetworkError(message)
}
