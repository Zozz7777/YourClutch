package com.clutch.partners.utils

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Build
import kotlinx.coroutines.delay
import java.io.IOException
import java.net.ConnectException
import java.net.SocketTimeoutException
import java.net.UnknownHostException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ErrorHandler @Inject constructor(
    private val context: Context
) {
    
    /**
     * Determines if an error is retryable based on the error type
     */
    fun isRetryableError(error: Throwable): Boolean {
        return when (error) {
            is ConnectException,
            is SocketTimeoutException,
            is UnknownHostException,
            is IOException -> true
            else -> false
        }
    }
    
    /**
     * Gets user-friendly error message based on error type
     */
    fun getErrorMessage(error: Throwable, currentLanguage: String = "en"): String {
        return when (error) {
            is ConnectException -> {
                if (currentLanguage == "ar") "لا يمكن الاتصال بالخادم" 
                else "Cannot connect to server"
            }
            is SocketTimeoutException -> {
                if (currentLanguage == "ar") "انتهت مهلة الاتصال" 
                else "Connection timeout"
            }
            is UnknownHostException -> {
                if (currentLanguage == "ar") "لا يمكن العثور على الخادم" 
                else "Cannot find server"
            }
            is IOException -> {
                if (currentLanguage == "ar") "خطأ في الشبكة" 
                else "Network error"
            }
            else -> {
                if (currentLanguage == "ar") "حدث خطأ غير متوقع" 
                else "An unexpected error occurred"
            }
        }
    }
    
    /**
     * Checks if device has internet connection
     */
    fun isNetworkAvailable(): Boolean {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val network = connectivityManager.activeNetwork ?: return false
            val networkCapabilities = connectivityManager.getNetworkCapabilities(network) ?: return false
            networkCapabilities.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ||
            networkCapabilities.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ||
            networkCapabilities.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET)
        } else {
            @Suppress("DEPRECATION")
            val networkInfo = connectivityManager.activeNetworkInfo
            networkInfo?.isConnected == true
        }
    }
    
    /**
     * Retry logic with exponential backoff
     */
    suspend fun <T> retryWithBackoff(
        maxRetries: Int = 3,
        initialDelay: Long = 1000,
        maxDelay: Long = 10000,
        multiplier: Double = 2.0,
        operation: suspend () -> T
    ): Result<T> {
        var currentDelay = initialDelay
        var lastException: Throwable? = null
        
        repeat(maxRetries) { attempt ->
            try {
                return Result.success(operation())
            } catch (e: Throwable) {
                lastException = e
                
                if (!isRetryableError(e) || attempt == maxRetries - 1) {
                    return Result.failure(e)
                }
                
                delay(currentDelay)
                currentDelay = (currentDelay * multiplier).toLong().coerceAtMost(maxDelay)
            }
        }
        
        return Result.failure(lastException ?: Exception("Unknown error"))
    }
    
    /**
     * Enhanced retry with network check
     */
    suspend fun <T> retryWithNetworkCheck(
        maxRetries: Int = 3,
        operation: suspend () -> T
    ): Result<T> {
        if (!isNetworkAvailable()) {
            return Result.failure(NoNetworkException())
        }
        
        return retryWithBackoff(maxRetries = maxRetries, operation = operation)
    }
}

/**
 * Custom exception for no network
 */
class NoNetworkException : Exception("No network connection available")

/**
 * Custom exception for server errors
 */
class ServerException(message: String) : Exception(message)

/**
 * Custom exception for validation errors
 */
class ValidationException(message: String) : Exception(message)

/**
 * Custom exception for authentication errors
 */
class AuthenticationException(message: String) : Exception(message)

/**
 * Custom exception for authorization errors
 */
class AuthorizationException(message: String) : Exception(message)
