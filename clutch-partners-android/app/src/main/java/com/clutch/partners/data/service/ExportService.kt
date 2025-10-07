package com.clutch.partners.data.service

import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ExportService @Inject constructor(
    private val apiService: ApiService
) {
    
    suspend fun exportOrders(format: String): Result<String> {
        return apiService.exportData(format, "orders")
    }
    
    suspend fun exportProducts(format: String): Result<String> {
        return apiService.exportData(format, "products")
    }
    
    suspend fun exportCustomers(format: String): Result<String> {
        return apiService.exportData(format, "customers")
    }
    
    suspend fun exportSales(format: String): Result<String> {
        return apiService.exportData(format, "sales")
    }
    
    suspend fun exportInventory(format: String): Result<String> {
        return apiService.exportData(format, "inventory")
    }
    
    suspend fun exportAuditLogs(format: String): Result<String> {
        return apiService.exportData(format, "audit_logs")
    }
}
