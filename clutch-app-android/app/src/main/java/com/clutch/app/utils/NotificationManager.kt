package com.clutch.app.utils

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.clutch.app.MainActivity
import com.clutch.app.R

object NotificationManager {
    private const val CHANNEL_ID = "clutch_notifications"
    private const val CHANNEL_NAME = "Clutch Notifications"
    private const val CHANNEL_DESCRIPTION = "Notifications for Clutch app"
    
    private const val SPECIAL_OFFERS_CHANNEL_ID = "clutch_special_offers"
    private const val SPECIAL_OFFERS_CHANNEL_NAME = "Special Offers"
    private const val SPECIAL_OFFERS_CHANNEL_DESCRIPTION = "Special offers and promotions"
    
    data class NotificationData(
        val id: Int,
        val title: String,
        val message: String,
        val type: NotificationType = NotificationType.REGULAR,
        val actionUrl: String? = null,
        val imageUrl: String? = null,
        val priority: NotificationPriority = NotificationPriority.NORMAL
    )
    
    enum class NotificationType {
        REGULAR,
        SPECIAL_OFFER,
        MAINTENANCE_REMINDER,
        ORDER_UPDATE,
        SYSTEM_UPDATE
    }
    
    enum class NotificationPriority {
        LOW,
        NORMAL,
        HIGH,
        URGENT
    }
    
    fun initialize(context: Context) {
        createNotificationChannels(context)
    }
    
    private fun createNotificationChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            
            // Regular notifications channel
            val regularChannel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                android.app.NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = CHANNEL_DESCRIPTION
                enableLights(true)
                enableVibration(true)
            }
            
            // Special offers channel
            val specialOffersChannel = NotificationChannel(
                SPECIAL_OFFERS_CHANNEL_ID,
                SPECIAL_OFFERS_CHANNEL_NAME,
                android.app.NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = SPECIAL_OFFERS_CHANNEL_DESCRIPTION
                enableLights(true)
                enableVibration(true)
                setShowBadge(true)
            }
            
            notificationManager.createNotificationChannel(regularChannel)
            notificationManager.createNotificationChannel(specialOffersChannel)
        }
    }
    
    fun sendNotification(context: Context, notification: NotificationData) {
        val channelId = when (notification.type) {
            NotificationType.SPECIAL_OFFER -> SPECIAL_OFFERS_CHANNEL_ID
            else -> CHANNEL_ID
        }
        
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("notification_type", notification.type.name)
            putExtra("action_url", notification.actionUrl)
        }
        
        val pendingIntent = PendingIntent.getActivity(
            context,
            notification.id,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        
        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setContentTitle(notification.title)
            .setContentText(notification.message)
            .setPriority(getNotificationPriority(notification.priority))
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setStyle(NotificationCompat.BigTextStyle().bigText(notification.message))
        
        // Add action button if actionUrl is provided
        if (notification.actionUrl != null) {
            val actionIntent = Intent(context, MainActivity::class.java).apply {
                putExtra("action_url", notification.actionUrl)
            }
            val actionPendingIntent = PendingIntent.getActivity(
                context,
                notification.id + 1000,
                actionIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            
            builder.addAction(
                R.drawable.ic_launcher_foreground,
                "View",
                actionPendingIntent
            )
        }
        
        with(NotificationManagerCompat.from(context)) {
            notify(notification.id, builder.build())
        }
    }
    
    private fun getNotificationPriority(priority: NotificationPriority): Int {
        return when (priority) {
            NotificationPriority.LOW -> NotificationCompat.PRIORITY_LOW
            NotificationPriority.NORMAL -> NotificationCompat.PRIORITY_DEFAULT
            NotificationPriority.HIGH -> NotificationCompat.PRIORITY_HIGH
            NotificationPriority.URGENT -> NotificationCompat.PRIORITY_MAX
        }
    }
    
    fun sendSpecialOfferNotification(
        context: Context,
        title: String,
        message: String,
        offerUrl: String? = null
    ) {
        val notification = NotificationData(
            id = System.currentTimeMillis().toInt(),
            title = title,
            message = message,
            type = NotificationType.SPECIAL_OFFER,
            actionUrl = offerUrl,
            priority = NotificationPriority.HIGH
        )
        sendNotification(context, notification)
    }
    
    fun sendMaintenanceReminder(
        context: Context,
        carName: String,
        serviceType: String
    ) {
        val notification = NotificationData(
            id = System.currentTimeMillis().toInt(),
            title = "Maintenance Reminder",
            message = "Your $carName needs $serviceType service soon",
            type = NotificationType.MAINTENANCE_REMINDER,
            priority = NotificationPriority.NORMAL
        )
        sendNotification(context, notification)
    }
}
