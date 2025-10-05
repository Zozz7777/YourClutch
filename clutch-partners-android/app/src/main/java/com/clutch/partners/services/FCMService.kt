package com.clutch.partners.services

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import com.clutch.partners.CompleteMainActivity
import com.clutch.partners.R
import com.clutch.partners.data.model.NotificationData
import com.clutch.partners.utils.LanguageManager
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class FCMService : FirebaseMessagingService() {

    // @Inject
    // lateinit var notificationRepository: NotificationRepository

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)

        // Handle data payload
        remoteMessage.data.let { data ->
            val title = data["title"] ?: getString(R.string.notifications_title)
            val body = data["body"] ?: ""
            val type = data["type"] ?: "general"
            val orderId = data["orderId"]
            val paymentId = data["paymentId"]
            val priority = data["priority"] ?: "normal"

            // Create notification data
            val notificationData = NotificationData(
                id = remoteMessage.messageId ?: System.currentTimeMillis().toString(),
                title = title,
                message = body,
                type = type,
                orderId = orderId,
                paymentId = paymentId,
                priority = priority,
                timestamp = System.currentTimeMillis(),
                isRead = false
            )

            // Save to local database
            // CoroutineScope(Dispatchers.IO).launch {
            //     notificationRepository.saveNotification(notificationData)
            // }

            // Show notification
            showNotification(notificationData)
        }

        // Handle notification payload
        remoteMessage.notification?.let { notification ->
            val title = notification.title ?: getString(R.string.notifications_title)
            val body = notification.body ?: ""

            val notificationData = NotificationData(
                id = remoteMessage.messageId ?: System.currentTimeMillis().toString(),
                title = title,
                message = body,
                type = "general",
                timestamp = System.currentTimeMillis(),
                isRead = false
            )

            showNotification(notificationData)
        }
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        
        // Send token to server
        // CoroutineScope(Dispatchers.IO).launch {
        //     notificationRepository.updateDeviceToken(token)
        // }
    }

    private fun showNotification(notificationData: NotificationData) {
        val context = this
        val isRTL = LanguageManager.isRTL(context)
        
        // Create notification channel
        createNotificationChannel()

        // Create intent for notification tap
        val intent = Intent(this, CompleteMainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("notification_type", notificationData.type)
            putExtra("notification_id", notificationData.id)
            notificationData.orderId?.let { putExtra("order_id", it) }
            notificationData.paymentId?.let { putExtra("payment_id", it) }
        }

        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Create action buttons
        val markAsReadIntent = Intent(this, NotificationActionReceiver::class.java).apply {
            action = "MARK_AS_READ"
            putExtra("notification_id", notificationData.id)
        }
        val markAsReadPendingIntent = PendingIntent.getBroadcast(
            this, 1, markAsReadIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Build notification
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(notificationData.title)
            .setContentText(notificationData.message)
            .setSmallIcon(R.drawable.ic_notification)
            // .setLargeIcon(null) // You can add a large icon here
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setPriority(getNotificationPriority(notificationData.priority))
            .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
            .setVibrate(longArrayOf(0, 300, 100, 300))
            .setLights(0xFF2196F3.toInt(), 1000, 1000)
            .addAction(
                R.drawable.ic_check,
                if (isRTL) "تم القراءة" else "Mark as Read",
                markAsReadPendingIntent
            )
            .setStyle(
                NotificationCompat.BigTextStyle()
                    .bigText(notificationData.message)
            )
            .build()

        // Show notification
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(notificationData.id.hashCode(), notification)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = CHANNEL_DESCRIPTION
                enableLights(true)
                lightColor = 0xFF2196F3.toInt()
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 300, 100, 300)
            }

            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun getNotificationPriority(priority: String): Int {
        return when (priority.lowercase()) {
            "high" -> NotificationCompat.PRIORITY_HIGH
            "low" -> NotificationCompat.PRIORITY_LOW
            else -> NotificationCompat.PRIORITY_DEFAULT
        }
    }

    companion object {
        private const val CHANNEL_ID = "clutch_partners_channel"
        private const val CHANNEL_NAME = "Clutch Partners Notifications"
        private const val CHANNEL_DESCRIPTION = "Notifications for Clutch Partners app"
    }
}
