package com.clutch.app.data.interceptors

import android.util.Log
import com.clutch.app.data.model.ApiError
import com.clutch.app.data.model.ApiResponse
import com.google.gson.Gson
import okhttp3.Interceptor
import okhttp3.Response
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NetworkErrorInterceptor @Inject constructor() : Interceptor {

    companion object {
        private const val TAG = "NetworkError"
    }

    @Throws(IOException::class)
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val response = chain.proceed(request)
        
        if (!response.isSuccessful) {
            val errorBody = response.peekBody(Long.MAX_VALUE).string()
            Log.e(TAG, "HTTP Error: ${response.code} - $errorBody")
            
            try {
                val gson = Gson()
                val apiError = gson.fromJson(errorBody, ApiError::class.java)
                
                when (response.code) {
                    401 -> {
                        Log.e(TAG, "Unauthorized - Token may be expired")
                        // Handle token expiration
                    }
                    403 -> {
                        Log.e(TAG, "Forbidden - Insufficient permissions")
                    }
                    404 -> {
                        Log.e(TAG, "Not Found - Resource not available")
                    }
                    422 -> {
                        Log.e(TAG, "Validation Error: ${apiError.message}")
                    }
                    500 -> {
                        Log.e(TAG, "Server Error: ${apiError.message}")
                    }
                    else -> {
                        Log.e(TAG, "Unknown Error: ${apiError.message}")
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to parse error response", e)
            }
        }
        
        return response
    }
}
