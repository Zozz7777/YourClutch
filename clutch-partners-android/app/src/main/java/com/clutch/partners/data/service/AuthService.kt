package com.clutch.partners.data.service

import com.clutch.partners.data.model.KYCDocument
import com.clutch.partners.data.model.User
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthService @Inject constructor(
    private val localStorageService: LocalStorageService,
    private val apiService: ApiService
) {
    
    suspend fun signIn(email: String, password: String): Result<User> {
        return apiService.signIn(email, password)
    }
    
    suspend fun signUp(
        partnerId: String,
        email: String,
        phone: String,
        password: String
    ): Result<User> {
        return apiService.signUp(
            partnerId = partnerId,
            email = email,
            phone = phone,
            password = password
        )
    }
    
    suspend fun uploadKYCDocument(_document: KYCDocument): Result<Boolean> {
        // TODO: Implement actual API call
        return Result.success(true)
    }
    
    suspend fun getCurrentUser(): User? {
        return localStorageService.getUser()
    }
    
    suspend fun getAuthToken(): String? {
        return localStorageService.getAuthToken()
    }
    
    fun logout() {
        localStorageService.clearUser()
        localStorageService.clearToken()
    }
}
