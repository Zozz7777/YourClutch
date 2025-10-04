package com.clutch.app.data.interceptors

import android.util.Log
import okhttp3.Interceptor
import okhttp3.Response
import java.io.IOException
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LoggingInterceptor @Inject constructor() : Interceptor {

    companion object {
        private const val TAG = "NetworkLogging"
    }

    @Throws(IOException::class)
    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        
        Log.d(TAG, "Request: ${request.method} ${request.url}")
        Log.d(TAG, "Headers: ${request.headers}")
        
        val startTime = System.currentTimeMillis()
        val response = chain.proceed(request)
        val endTime = System.currentTimeMillis()
        
        Log.d(TAG, "Response: ${response.code} ${response.message}")
        Log.d(TAG, "Time: ${endTime - startTime}ms")
        
        return response
    }
}
