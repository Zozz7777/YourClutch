package com.clutch.partners.data.repository

import com.clutch.partners.data.model.User
import com.clutch.partners.data.model.UserRole
import com.clutch.partners.data.model.Permission
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor() {
    
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
    
    // Mock login for testing
    suspend fun login(email: String, password: String): Result<User> {
        return try {
            // Mock authentication - in real app, this would call API
            val user = when (email) {
                "owner@clutch.com" -> User(
                    id = "1",
                    email = email,
                    name = "Business Owner",
                    role = UserRole.OWNER,
                    permissions = UserRole.OWNER.permissions
                )
                "manager@clutch.com" -> User(
                    id = "2",
                    email = email,
                    name = "Store Manager",
                    role = UserRole.MANAGER,
                    permissions = UserRole.MANAGER.permissions
                )
                "staff@clutch.com" -> User(
                    id = "3",
                    email = email,
                    name = "Store Staff",
                    role = UserRole.STAFF,
                    permissions = UserRole.STAFF.permissions
                )
                "accountant@clutch.com" -> User(
                    id = "4",
                    email = email,
                    name = "Accountant",
                    role = UserRole.ACCOUNTANT,
                    permissions = UserRole.ACCOUNTANT.permissions
                )
                "hr@clutch.com" -> User(
                    id = "5",
                    email = email,
                    name = "HR Manager",
                    role = UserRole.HR,
                    permissions = UserRole.HR.permissions
                )
                else -> throw Exception("Invalid credentials")
            }
            
            setCurrentUser(user)
            Result.success(user)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun getCurrentUserFlow(): Flow<User?> = flowOf(currentUser)
}