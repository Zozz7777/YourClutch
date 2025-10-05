package com.clutch.partners.data.repository

import com.clutch.partners.data.model.KYCDocument
import com.clutch.partners.data.model.User
import com.clutch.partners.data.service.AuthService
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val authService: AuthService
) {
    
    suspend fun signIn(email: String, password: String): Result<User> {
        return authService.signIn(email, password)
    }
    
    suspend fun signUp(
        partnerId: String,
        email: String,
        phone: String,
        password: String,
        businessName: String,
        businessType: com.clutch.partners.data.model.PartnerType
    ): Result<User> {
        return authService.signUp(partnerId, email, phone, password, businessName, businessType)
    }
    
    suspend fun uploadKYCDocument(document: KYCDocument): Result<Boolean> {
        return authService.uploadKYCDocument(document)
    }
    
    suspend fun getCurrentUser(): User? {
        return authService.getCurrentUser()
    }
    
    fun logout() {
        authService.logout()
    }
}
