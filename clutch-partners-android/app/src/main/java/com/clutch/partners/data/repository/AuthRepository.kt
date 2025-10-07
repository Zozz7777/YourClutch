package com.clutch.partners.data.repository

import com.clutch.partners.data.model.User
import com.clutch.partners.data.model.UserRole
import com.clutch.partners.data.model.Permission
import com.clutch.partners.data.model.PartnerType
import com.clutch.partners.data.service.ApiService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import java.util.Date
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val apiService: ApiService
) {
    
    private var currentUser: User? = null
    
    fun getCurrentUser(): User? = currentUser
    
    fun setCurrentUser(user: User) {
        currentUser = user
    }
    
    fun logout() {
        currentUser = null
    }
    
    fun isLoggedIn(): Boolean = currentUser != null
    
    fun hasPermission(permission: Permission): Boolean {
        return currentUser?.hasPermission(permission) ?: false
    }
    
    fun hasAnyPermission(permissions: List<Permission>): Boolean {
        return currentUser?.hasAnyPermission(permissions) ?: false
    }
    
    fun hasAllPermissions(permissions: List<Permission>): Boolean {
        return currentUser?.hasAllPermissions(permissions) ?: false
    }
    
    fun getUserRole(): UserRole? = currentUser?.role
    
    fun isOwner(): Boolean = currentUser?.role == UserRole.OWNER
    fun isManager(): Boolean = currentUser?.role == UserRole.MANAGER
    fun isStaff(): Boolean = currentUser?.role == UserRole.STAFF
    fun isAccountant(): Boolean = currentUser?.role == UserRole.ACCOUNTANT
    fun isHR(): Boolean = currentUser?.role == UserRole.HR
    
    // Test connectivity first
    suspend fun testConnection(): Result<String> {
        println("🔐 AuthRepository: Testing connection...")
        return try {
            val result = apiService.testConnection()
            println("🔐 AuthRepository: Connection test result: ${result.isSuccess}")
            result
        } catch (e: Exception) {
            println("🔐 AuthRepository: Connection test error: ${e.message}")
            Result.failure(e)
        }
    }
    
    // Real backend authentication
    suspend fun login(email: String, password: String): Result<User> {
        println("🔐 AuthRepository: login called with email: $email")
        return try {
            // Call real backend API
            println("🔐 AuthRepository: Calling apiService.signIn")
            val result = apiService.signIn(email, password)
            println("🔐 AuthRepository: API result: ${result.isSuccess}")
            result.onSuccess { user ->
                setCurrentUser(user)
            }
            result
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    suspend fun signUp(
        partnerId: String, 
        email: String, 
        phone: String, 
        password: String, 
        businessName: String, 
        ownerName: String, 
        businessType: String, 
        street: String, 
        city: String, 
        state: String, 
        zipCode: String
    ): Result<User> {
        println("🔐 AuthRepository: signUp called with partnerId: $partnerId, email: $email")
        return try {
            // Call real backend API for sign up
            val result = apiService.signUp(partnerId, email, phone, password, businessName, ownerName, businessType, street, city, state, zipCode)
            println("🔐 AuthRepository: signUp API result: ${result.isSuccess}")
            result.onSuccess { user ->
                setCurrentUser(user)
            }
            result
        } catch (e: Exception) {
            println("🔐 AuthRepository: signUp error: ${e.message}")
            Result.failure(e)
        }
    }
    
    suspend fun requestToJoin(
        businessName: String,
        businessType: String,
        contactName: String,
        email: String,
        phone: String,
        address: String,
        description: String
    ): Result<User> {
        println("🔐 AuthRepository: requestToJoin called with email: $email")
        return try {
            // Call real backend API
            println("🔐 AuthRepository: Calling apiService.requestToJoin")
            val result = apiService.requestToJoin(businessName, businessType, contactName, email, phone, address, description)
            println("🔐 AuthRepository: API result: ${result.isSuccess}")
            result.onSuccess { user ->
                setCurrentUser(user)
            }
            result
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun getCurrentUserFlow(): Flow<User?> = flowOf(currentUser)
}
