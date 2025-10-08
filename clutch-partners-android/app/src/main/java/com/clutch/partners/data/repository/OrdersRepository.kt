package com.clutch.partners.data.repository

import com.clutch.partners.data.model.Order
import com.clutch.partners.data.service.ApiService
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OrdersRepository @Inject constructor(
    private val apiService: ApiService
) {
    
    suspend fun getOrders(): Result<List<Order>> {
        return apiService.getOrders()
    }
    
    suspend fun searchOrders(query: String): Result<List<Order>> {
        // TODO: Implement search functionality
        // For now, return all orders
        return apiService.getOrders()
    }
    
    suspend fun updateOrderStatus(orderId: String, status: String): Result<Unit> {
        // TODO: Implement order status update
        return Result.success(Unit)
    }
}
