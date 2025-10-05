package com.clutch.partners.data.model

import java.util.Date

data class User(
    val id: String,
    val email: String,
    val phone: String,
    val partnerId: String,
    val businessName: String,
    val businessType: PartnerType,
    val role: UserRole,
    val permissions: List<Permission>,
    val isVerified: Boolean,
    val createdAt: Date,
    val lastLoginAt: Date?,
    val profileImage: String?,
    val address: String?,
    val taxId: String?
) {
    fun hasPermission(permission: Permission): Boolean {
        return permissions.contains(permission)
    }
    
    fun hasAnyPermission(permissions: List<Permission>): Boolean {
        return permissions.any { this.permissions.contains(it) }
    }
    
    fun hasAllPermissions(permissions: List<Permission>): Boolean {
        return permissions.all { this.permissions.contains(it) }
    }
}

enum class PartnerType {
    REPAIR_CENTER,
    AUTO_PARTS,
    ACCESSORIES,
    IMPORTER,
    MANUFACTURER,
    SERVICE_CENTER
}

enum class UserRole(val displayName: String, val permissions: List<Permission>) {
    OWNER(
        displayName = "Owner",
        permissions = Permission.values().toList()
    ),
    MANAGER(
        displayName = "Manager",
        permissions = listOf(
            Permission.VIEW_ORDERS,
            Permission.MANAGE_ORDERS,
            Permission.VIEW_INVOICES,
            Permission.MANAGE_INVOICES,
            Permission.VIEW_PAYMENTS,
            Permission.VIEW_INVENTORY,
            Permission.MANAGE_INVENTORY,
            Permission.VIEW_REPORTS,
            Permission.VIEW_SETTINGS,
            Permission.MANAGE_SETTINGS,
            Permission.VIEW_STAFF,
            Permission.MANAGE_STAFF,
            Permission.VIEW_NOTIFICATIONS,
            Permission.VIEW_SUPPORT,
            Permission.MANAGE_SUPPORT,
            Permission.VIEW_AUDIT_LOGS,
            Permission.VIEW_WARRANTY,
            Permission.MANAGE_WARRANTY,
            Permission.VIEW_EXPORT,
            Permission.MANAGE_EXPORT
        )
    ),
    STAFF(
        displayName = "Staff",
        permissions = listOf(
            Permission.VIEW_ORDERS,
            Permission.MANAGE_ORDERS,
            Permission.VIEW_INVENTORY,
            Permission.VIEW_NOTIFICATIONS,
            Permission.VIEW_SUPPORT,
            Permission.VIEW_WARRANTY
        )
    ),
    ACCOUNTANT(
        displayName = "Accountant",
        permissions = listOf(
            Permission.VIEW_ORDERS,
            Permission.VIEW_INVOICES,
            Permission.VIEW_PAYMENTS,
            Permission.VIEW_REPORTS,
            Permission.VIEW_EXPORT,
            Permission.MANAGE_EXPORT,
            Permission.VIEW_AUDIT_LOGS
        )
    ),
    HR(
        displayName = "HR",
        permissions = listOf(
            Permission.VIEW_STAFF,
            Permission.MANAGE_STAFF,
            Permission.VIEW_AUDIT_LOGS,
            Permission.VIEW_REPORTS
        )
    )
}

enum class Permission(val displayName: String, val description: String) {
    // Orders
    VIEW_ORDERS("View Orders", "Can view order information"),
    MANAGE_ORDERS("Manage Orders", "Can create, update, and delete orders"),
    
    // Invoices
    VIEW_INVOICES("View Invoices", "Can view invoice information"),
    MANAGE_INVOICES("Manage Invoices", "Can create, update, and delete invoices"),
    
    // Payments
    VIEW_PAYMENTS("View Payments", "Can view payment information"),
    MANAGE_PAYMENTS("Manage Payments", "Can process and manage payments"),
    
    // Inventory
    VIEW_INVENTORY("View Inventory", "Can view inventory information"),
    MANAGE_INVENTORY("Manage Inventory", "Can update inventory levels and products"),
    
    // Reports
    VIEW_REPORTS("View Reports", "Can view business reports"),
    MANAGE_REPORTS("Manage Reports", "Can create and manage reports"),
    
    // Settings
    VIEW_SETTINGS("View Settings", "Can view application settings"),
    MANAGE_SETTINGS("Manage Settings", "Can modify application settings"),
    
    // Staff Management
    VIEW_STAFF("View Staff", "Can view staff information"),
    MANAGE_STAFF("Manage Staff", "Can add, update, and remove staff"),
    
    // Notifications
    VIEW_NOTIFICATIONS("View Notifications", "Can view notifications"),
    MANAGE_NOTIFICATIONS("Manage Notifications", "Can manage notification settings"),
    
    // Support
    VIEW_SUPPORT("View Support", "Can view support tickets"),
    MANAGE_SUPPORT("Manage Support", "Can manage support tickets"),
    
    // Audit
    VIEW_AUDIT_LOGS("View Audit Logs", "Can view audit logs"),
    MANAGE_AUDIT_LOGS("Manage Audit Logs", "Can manage audit logs"),
    
    // Warranty & Disputes
    VIEW_WARRANTY("View Warranty", "Can view warranty claims and disputes"),
    MANAGE_WARRANTY("Manage Warranty", "Can manage warranty claims and disputes"),
    
    // Export
    VIEW_EXPORT("View Export", "Can view export options"),
    MANAGE_EXPORT("Manage Export", "Can create and manage data exports"),
    
    // KYC
    VIEW_KYC("View KYC", "Can view KYC documents"),
    MANAGE_KYC("Manage KYC", "Can manage KYC verification"),
    
    // Dashboard
    VIEW_DASHBOARD("View Dashboard", "Can view business dashboard"),
    MANAGE_DASHBOARD("Manage Dashboard", "Can customize dashboard")
}
