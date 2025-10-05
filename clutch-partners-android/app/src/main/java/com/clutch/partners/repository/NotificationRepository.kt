package com.clutch.partners.repository

import com.clutch.partners.data.api.PartnersApiService
import com.clutch.partners.data.local.NotificationDao
import com.clutch.partners.data.model.NotificationData
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NotificationRepository @Inject constructor(
    private val notificationDao: NotificationDao,
    private val apiService: PartnersApiService
) {
    
    fun getAllNotifications(): Flow<List<NotificationData>> {
        return notificationDao.getAllNotifications()
    }
    
    fun getUnreadNotifications(): Flow<List<NotificationData>> {
        return notificationDao.getUnreadNotifications()
    }
    
    fun getNotificationsByType(type: String): Flow<List<NotificationData>> {
        return notificationDao.getNotificationsByType(type)
    }
    
    suspend fun saveNotification(notification: NotificationData) {
        notificationDao.insertNotification(notification)
        
        // Sync with server
        try {
                // apiService.sendPushNotification(
                //     token = "Bearer ${getAuthToken()}", // You'll need to implement this
                //     request = NotificationRequest(
                //         title = notification.title,
                //         body = notification.message,
                //         type = notification.type,
                //         orderId = notification.orderId,
                //         paymentId = notification.paymentId,
                //         priority = notification.priority
                //     )
                // )
        } catch (e: Exception) {
            // Handle error - maybe queue for later sync
        }
    }
    
    suspend fun markAsRead(notificationId: String) {
        notificationDao.markAsRead(notificationId)
    }
    
    suspend fun markAllAsRead() {
        notificationDao.markAllAsRead()
    }
    
    suspend fun deleteNotification(notificationId: String) {
        notificationDao.deleteNotification(notificationId)
    }
    
    suspend fun updateDeviceToken(token: String) {
        try {
            // apiService.updateDeviceToken(
            //     token = "Bearer ${getAuthToken()}",
            //     request = DeviceTokenRequest(token)
            // )
        } catch (e: Exception) {
            // Handle error
        }
    }
    
    private suspend fun getAuthToken(): String {
        // Implement token retrieval from secure storage
        return ""
    }
}

data class NotificationRequest(
    val title: String,
    val body: String,
    val type: String,
    val orderId: String? = null,
    val paymentId: String? = null,
    val priority: String = "normal"
)

data class DeviceTokenRequest(
    val token: String
)
