package com.clutch.partners.data.repository

import com.clutch.partners.data.model.DashboardData
import com.clutch.partners.data.model.Notification
import com.clutch.partners.data.model.Order
import com.clutch.partners.data.model.Product
import com.clutch.partners.data.service.MainService
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MainRepository @Inject constructor(
    private val mainService: MainService
) {
    
    suspend fun getDashboardData(): Result<DashboardData> {
        return mainService.getDashboardData()
    }
    
    suspend fun getOrders(): Result<List<Order>> {
        return mainService.getOrders()
    }
    
    suspend fun getProducts(): Result<List<Product>> {
        return mainService.getProducts()
    }
    
    suspend fun getNotifications(): Result<List<Notification>> {
        return mainService.getNotifications()
    }
}
