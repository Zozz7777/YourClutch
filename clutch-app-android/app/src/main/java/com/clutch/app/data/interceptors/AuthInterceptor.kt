package com.clutch.app.data.interceptors

import com.clutch.app.utils.SessionManager
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthInterceptor @Inject constructor(
    private val sessionManager: SessionManager
) : Interceptor {

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        
        // Get auth token from session manager
        val authToken = sessionManager.getAuthToken()
        
        val newRequest = if (authToken != null) {
            originalRequest.newBuilder()
                .addHeader("Authorization", "Bearer $authToken")
                .addHeader("Content-Type", "application/json")
                .addHeader("Accept", "application/json")
                .build()
        } else {
            originalRequest.newBuilder()
                .addHeader("Content-Type", "application/json")
                .addHeader("Accept", "application/json")
                .build()
        }
        
        return chain.proceed(newRequest)
    }
}
