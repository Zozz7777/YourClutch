package com.clutch.partners.data.repository

import com.clutch.partners.data.model.User
import com.clutch.partners.data.model.UserRole
import com.clutch.partners.data.model.Permission
import com.clutch.partners.data.model.PartnerType
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import java.util.Date
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
                    phone = "+201234567890",
                    partnerId = "PARTNER001",
                    businessName = "Business Owner",
                    businessType = PartnerType.REPAIR_CENTER,
                    role = UserRole.OWNER,
                    permissions = UserRole.OWNER.permissions,
                    isVerified = true,
                    createdAt = Date(),
                    lastLoginAt = Date(),
                    profileImage = null,
                    address = "Cairo, Egypt",
                    taxId = "123456789"
                )
                "manager@clutch.com" -> User(
                    id = "2",
                    email = email,
                    phone = "+201234567891",
                    partnerId = "PARTNER002",
                    businessName = "Store Manager",
                    businessType = PartnerType.AUTO_PARTS,
                    role = UserRole.MANAGER,
                    permissions = UserRole.MANAGER.permissions,
                    isVerified = true,
                    createdAt = Date(),
                    lastLoginAt = Date(),
                    profileImage = null,
                    address = "Alexandria, Egypt",
                    taxId = "123456790"
                )
                "staff@clutch.com" -> User(
                    id = "3",
                    email = email,
                    phone = "+201234567892",
                    partnerId = "PARTNER003",
                    businessName = "Store Staff",
                    businessType = PartnerType.SERVICE_CENTER,
                    role = UserRole.STAFF,
                    permissions = UserRole.STAFF.permissions,
                    isVerified = true,
                    createdAt = Date(),
                    lastLoginAt = Date(),
                    profileImage = null,
                    address = "Giza, Egypt",
                    taxId = "123456791"
                )
                "accountant@clutch.com" -> User(
                    id = "4",
                    email = email,
                    phone = "+201234567893",
                    partnerId = "PARTNER004",
                    businessName = "Accountant",
                    businessType = PartnerType.REPAIR_CENTER,
                    role = UserRole.ACCOUNTANT,
                    permissions = UserRole.ACCOUNTANT.permissions,
                    isVerified = true,
                    createdAt = Date(),
                    lastLoginAt = Date(),
                    profileImage = null,
                    address = "Cairo, Egypt",
                    taxId = "123456792"
                )
                "hr@clutch.com" -> User(
                    id = "5",
                    email = email,
                    phone = "+201234567894",
                    partnerId = "PARTNER005",
                    businessName = "HR Manager",
                    businessType = PartnerType.REPAIR_CENTER,
                    role = UserRole.HR,
                    permissions = UserRole.HR.permissions,
                    isVerified = true,
                    createdAt = Date(),
                    lastLoginAt = Date(),
                    profileImage = null,
                    address = "Cairo, Egypt",
                    taxId = "123456793"
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