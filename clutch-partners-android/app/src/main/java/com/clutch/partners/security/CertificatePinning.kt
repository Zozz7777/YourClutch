package com.clutch.partners.security

import okhttp3.CertificatePinner
import okhttp3.OkHttpClient
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class CertificatePinning @Inject constructor() {
    
    fun createPinnedClient(): OkHttpClient {
        val certificatePinner = CertificatePinner.Builder()
            .add("api.clutchpartners.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
            .add("api.clutchpartners.com", "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=")
            .build()
        
        return OkHttpClient.Builder()
            .certificatePinner(certificatePinner)
            .build()
    }
    
    fun createPinnedClientForTesting(): OkHttpClient {
        // For testing environments, use a more lenient pinning
        val certificatePinner = CertificatePinner.Builder()
            .add("api.clutchpartners.com", "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
            .build()
        
        return OkHttpClient.Builder()
            .certificatePinner(certificatePinner)
            .build()
    }
}
