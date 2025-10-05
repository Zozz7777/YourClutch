package com.clutch.partners.services

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class NotificationActionReceiver : BroadcastReceiver() {

    // @Inject
    // lateinit var notificationRepository: NotificationRepository

    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            "MARK_AS_READ" -> {
                val notificationId = intent.getStringExtra("notification_id")
                // notificationId?.let { id ->
                //     CoroutineScope(Dispatchers.IO).launch {
                //         notificationRepository.markAsRead(id)
                //     }
                // }
            }
            "DISMISS" -> {
                val notificationId = intent.getStringExtra("notification_id")
                // notificationId?.let { id ->
                //     CoroutineScope(Dispatchers.IO).launch {
                //         notificationRepository.deleteNotification(id)
                //     }
                // }
            }
        }
    }
}
