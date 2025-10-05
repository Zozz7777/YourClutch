package com.clutch.partners.offline

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.util.Log
import androidx.work.*
import com.clutch.partners.data.local.NotificationDao
import com.clutch.partners.data.model.*
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class OfflineManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val notificationDao: NotificationDao
) {
    
    private val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    private val workManager = WorkManager.getInstance(context)
    
    private val _isOnline = MutableStateFlow(true)
    val isOnline: StateFlow<Boolean> = _isOnline.asStateFlow()
    
    private val _pendingSyncItems = MutableStateFlow(0)
    val pendingSyncItems: StateFlow<Int> = _pendingSyncItems.asStateFlow()
    
    init {
        setupNetworkCallback()
        startPeriodicSync()
    }
    
    private fun setupNetworkCallback() {
        val networkRequest = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
            
        connectivityManager.registerNetworkCallback(networkRequest, object : ConnectivityManager.NetworkCallback() {
            override fun onAvailable(network: Network) {
                super.onAvailable(network)
                _isOnline.value = true
                Log.d("OfflineManager", "Network available")
                syncPendingData()
            }
            
            override fun onLost(network: Network) {
                super.onLost(network)
                _isOnline.value = false
                Log.d("OfflineManager", "Network lost")
            }
        })
    }
    
    private fun startPeriodicSync() {
        val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(
            15, TimeUnit.MINUTES
        )
            .setConstraints(
                Constraints.Builder()
                    .setRequiredNetworkType(NetworkType.CONNECTED)
                    .build()
            )
            .build()
            
        workManager.enqueueUniquePeriodicWork(
            "sync_work",
            ExistingPeriodicWorkPolicy.KEEP,
            syncRequest
        )
    }
    
    fun queueForSync(data: SyncableData) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                when (data) {
                    is Order -> queueOrderSync(data)
                    is Payment -> queuePaymentSync(data)
                    is NotificationData -> queueNotificationSync(data)
                    else -> Log.w("OfflineManager", "Unknown syncable data type")
                }
                updatePendingSyncCount()
            } catch (e: Exception) {
                Log.e("OfflineManager", "Failed to queue data for sync", e)
            }
        }
    }
    
    private suspend fun queueOrderSync(order: Order) {
        // Store order in local database for sync
        // This would be implemented with a local OrderDao
        Log.d("OfflineManager", "Queued order for sync: ${order.id}")
    }
    
    private suspend fun queuePaymentSync(payment: Payment) {
        // Store payment in local database for sync
        // This would be implemented with a local PaymentDao
        Log.d("OfflineManager", "Queued payment for sync: ${payment.id}")
    }
    
    private suspend fun queueNotificationSync(notification: NotificationData) {
        notificationDao.insertNotification(notification)
        Log.d("OfflineManager", "Queued notification for sync: ${notification.id}")
    }
    
    private fun syncPendingData() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Sync all pending data
                syncPendingOrders()
                syncPendingPayments()
                syncPendingNotifications()
                updatePendingSyncCount()
            } catch (e: Exception) {
                Log.e("OfflineManager", "Failed to sync pending data", e)
            }
        }
    }
    
    private suspend fun syncPendingOrders() {
        // Implement order sync logic
        Log.d("OfflineManager", "Syncing pending orders")
    }
    
    private suspend fun syncPendingPayments() {
        // Implement payment sync logic
        Log.d("OfflineManager", "Syncing pending payments")
    }
    
    private suspend fun syncPendingNotifications() {
        // Implement notification sync logic
        Log.d("OfflineManager", "Syncing pending notifications")
    }
    
    private suspend fun updatePendingSyncCount() {
        // Count pending sync items
        val count = 0 // This would count actual pending items
        _pendingSyncItems.value = count
    }
    
    fun forceSync() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                syncPendingData()
            } catch (e: Exception) {
                Log.e("OfflineManager", "Failed to force sync", e)
            }
        }
    }
    
    fun clearSyncQueue() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Clear all pending sync items
                Log.d("OfflineManager", "Cleared sync queue")
                updatePendingSyncCount()
            } catch (e: Exception) {
                Log.e("OfflineManager", "Failed to clear sync queue", e)
            }
        }
    }
}

interface SyncableData

class SyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {
    
    override suspend fun doWork(): Result {
        return try {
            // Perform sync operations
            Log.d("SyncWorker", "Performing background sync")
            Result.success()
        } catch (e: Exception) {
            Log.e("SyncWorker", "Sync failed", e)
            Result.retry()
        }
    }
}
