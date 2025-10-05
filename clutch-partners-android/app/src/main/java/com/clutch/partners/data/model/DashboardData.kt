package com.clutch.partners.data.model

import java.util.Date

data class DashboardData(
    val revenue: RevenueData,
    val orders: OrdersData,
    val inventory: InventoryData,
    val customers: CustomersData,
    val performance: PerformanceData
)

data class RevenueData(
    val today: Double,
    val thisWeek: Double,
    val thisMonth: Double,
    val thisYear: Double,
    val growthRate: Double
)

data class OrdersData(
    val total: Int,
    val pending: Int,
    val completed: Int,
    val cancelled: Int,
    val todayOrders: Int
)

data class InventoryData(
    val totalProducts: Int,
    val lowStock: Int,
    val outOfStock: Int,
    val totalValue: Double
)

data class CustomersData(
    val total: Int,
    val newThisMonth: Int,
    val active: Int,
    val loyaltyMembers: Int
)

data class PerformanceData(
    val averageOrderValue: Double,
    val customerSatisfaction: Double,
    val completionRate: Double,
    val responseTime: Double
)
