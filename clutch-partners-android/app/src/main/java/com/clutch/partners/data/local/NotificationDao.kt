package com.clutch.partners.data.local

import androidx.room.*
import com.clutch.partners.data.model.NotificationData
import kotlinx.coroutines.flow.Flow

@Dao
interface NotificationDao {
    
    @Query("SELECT * FROM notifications ORDER BY timestamp DESC")
    fun getAllNotifications(): Flow<List<NotificationData>>
    
    @Query("SELECT * FROM notifications WHERE isRead = 0 ORDER BY timestamp DESC")
    fun getUnreadNotifications(): Flow<List<NotificationData>>
    
    @Query("SELECT * FROM notifications WHERE type = :type ORDER BY timestamp DESC")
    fun getNotificationsByType(type: String): Flow<List<NotificationData>>
    
    @Query("SELECT COUNT(*) FROM notifications WHERE isRead = 0")
    fun getUnreadCount(): Flow<Int>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNotification(notification: NotificationData)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertNotifications(notifications: List<NotificationData>)
    
    @Update
    suspend fun updateNotification(notification: NotificationData)
    
    @Query("UPDATE notifications SET isRead = 1 WHERE id = :notificationId")
    suspend fun markAsRead(notificationId: String)
    
    @Query("UPDATE notifications SET isRead = 1")
    suspend fun markAllAsRead()
    
    @Query("DELETE FROM notifications WHERE id = :notificationId")
    suspend fun deleteNotification(notificationId: String)
    
    @Query("DELETE FROM notifications WHERE isRead = 1 AND timestamp < :cutoffTime")
    suspend fun deleteOldReadNotifications(cutoffTime: Long)
    
    @Query("DELETE FROM notifications")
    suspend fun deleteAllNotifications()
}
