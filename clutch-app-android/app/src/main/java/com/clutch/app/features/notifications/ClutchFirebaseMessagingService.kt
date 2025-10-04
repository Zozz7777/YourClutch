package com.clutch.app.features.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import com.clutch.app.MainActivity
import com.clutch.app.data.model.NotificationData

// Placeholder implementation - Firebase Cloud Messaging will be enabled when Firebase is properly configured
class ClutchFirebaseMessagingService : android.app.Service() {

    private val notificationManager: NotificationManager by lazy {
        getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    }

    override fun onBind(intent: Intent?) = null

    fun handleMessage(notificationData: NotificationData) {
        Log.d("FCM", "Handling notification: ${notificationData.title}")
        showNotification(notificationData)
    }

    private fun showNotification(notificationData: NotificationData) {
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            putExtra("notification_id", notificationData.id)
            putExtra("notification_type", notificationData.type)
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this,
            notificationData.id.hashCode(),
            intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        )

        val channelId = "clutch_notification_channel"
        val defaultSoundUri = android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION)

        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(com.clutch.app.R.drawable.ic_launcher_foreground)
            .setContentTitle(notificationData.title)
            .setContentText(notificationData.body)
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)

        // Create the NotificationChannel, but only on API 26+ because
        // the NotificationChannel class is new and not in the support library
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Clutch App Notifications",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Notifications for Clutch App"
            }
            notificationManager.createNotificationChannel(channel)
        }

        notificationManager.notify(notificationData.id.hashCode(), notificationBuilder.build())
    }
}