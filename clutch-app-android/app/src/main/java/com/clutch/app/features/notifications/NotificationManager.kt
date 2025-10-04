package com.clutch.app.features.notifications

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.app.data.model.NotificationData
import com.clutch.app.data.model.NotificationSettings
import com.clutch.app.data.repository.ClutchRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class NotificationUiState(
    val isLoading: Boolean = false,
    val notifications: List<NotificationData> = emptyList(),
    val unreadCount: Int = 0,
    val settings: NotificationSettings = NotificationSettings(),
    val errorMessage: String = ""
)

@HiltViewModel
class NotificationManager @Inject constructor(
    private val repository: ClutchRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(NotificationUiState())
    val uiState: StateFlow<NotificationUiState> = _uiState.asStateFlow()

    fun loadNotifications() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = "")
            try {
                val result = repository.getNotifications()
                if (result.isSuccess) {
                    val notifications = result.getOrNull() ?: emptyList()
                    val unreadCount = notifications.count { !it.isRead }
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        notifications = notifications,
                        unreadCount = unreadCount
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = result.exceptionOrNull()?.message ?: "Failed to load notifications"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Failed to load notifications: ${e.message}"
                )
            }
        }
    }

    fun loadNotificationSettings() {
        viewModelScope.launch {
            try {
                val result = repository.getNotificationSettings()
                if (result.isSuccess) {
                    _uiState.value = _uiState.value.copy(
                        settings = result.getOrNull() ?: NotificationSettings()
                    )
                }
            } catch (e: Exception) {
                // Handle error silently for settings
            }
        }
    }

    fun markAsRead(notificationId: String) {
        viewModelScope.launch {
            try {
                val result = repository.markNotificationAsRead(notificationId)
                if (result.isSuccess) {
                    // Update local state
                    val updatedNotifications = _uiState.value.notifications.map { notification ->
                        if (notification.id == notificationId) {
                            notification.copy(isRead = true)
                        } else {
                            notification
                        }
                    }
                    val unreadCount = updatedNotifications.count { !it.isRead }
                    _uiState.value = _uiState.value.copy(
                        notifications = updatedNotifications,
                        unreadCount = unreadCount
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = "Failed to mark notification as read: ${e.message}"
                )
            }
        }
    }

    fun markAllAsRead() {
        viewModelScope.launch {
            try {
                val result = repository.markAllNotificationsAsRead()
                if (result.isSuccess) {
                    val updatedNotifications = _uiState.value.notifications.map { notification ->
                        notification.copy(isRead = true)
                    }
                    _uiState.value = _uiState.value.copy(
                        notifications = updatedNotifications,
                        unreadCount = 0
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = "Failed to mark all notifications as read: ${e.message}"
                )
            }
        }
    }

    fun updateNotificationSettings(settings: NotificationSettings) {
        viewModelScope.launch {
            try {
                val result = repository.updateNotificationSettings(settings)
                if (result.isSuccess) {
                    _uiState.value = _uiState.value.copy(settings = settings)
                } else {
                    _uiState.value = _uiState.value.copy(
                        errorMessage = result.exceptionOrNull()?.message ?: "Failed to update settings"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = "Failed to update notification settings: ${e.message}"
                )
            }
        }
    }

    fun deleteNotification(notificationId: String) {
        viewModelScope.launch {
            try {
                val result = repository.deleteNotification(notificationId)
                if (result.isSuccess) {
                    val updatedNotifications = _uiState.value.notifications.filter { 
                        it.id != notificationId 
                    }
                    val unreadCount = updatedNotifications.count { !it.isRead }
                    _uiState.value = _uiState.value.copy(
                        notifications = updatedNotifications,
                        unreadCount = unreadCount
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = "Failed to delete notification: ${e.message}"
                )
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = "")
    }

    // Local notification methods
    fun showServiceNotification(title: String, body: String, data: Map<String, String> = emptyMap()) {
        val notificationData = NotificationData(
            id = System.currentTimeMillis().toString(),
            title = title,
            body = body,
            type = "service",
            data = data,
            timestamp = System.currentTimeMillis()
        )
        // Placeholder implementation - will be replaced with actual notification service
        // TODO: Implement notification display
    }

    fun showBookingNotification(title: String, body: String, bookingId: String) {
        val notificationData = NotificationData(
            id = System.currentTimeMillis().toString(),
            title = title,
            body = body,
            type = "booking",
            data = mapOf("booking_id" to bookingId),
            timestamp = System.currentTimeMillis()
        )
        // Placeholder implementation - will be replaced with actual notification service
        // TODO: Implement notification display
    }

    fun showLoyaltyNotification(title: String, body: String, rewardId: String? = null) {
        val notificationData = NotificationData(
            id = System.currentTimeMillis().toString(),
            title = title,
            body = body,
            type = "loyalty",
            data = rewardId?.let { mapOf("reward_id" to it) } ?: emptyMap(),
            timestamp = System.currentTimeMillis()
        )
        // Placeholder implementation - will be replaced with actual notification service
        // TODO: Implement notification display
    }

    fun showMaintenanceNotification(title: String, body: String, carId: String) {
        val notificationData = NotificationData(
            id = System.currentTimeMillis().toString(),
            title = title,
            body = body,
            type = "maintenance",
            data = mapOf("car_id" to carId),
            timestamp = System.currentTimeMillis()
        )
        // Placeholder implementation - will be replaced with actual notification service
        // TODO: Implement notification display
    }

    fun showPromotionNotification(title: String, body: String, promotionId: String) {
        val notificationData = NotificationData(
            id = System.currentTimeMillis().toString(),
            title = title,
            body = body,
            type = "promotion",
            data = mapOf("promotion_id" to promotionId),
            timestamp = System.currentTimeMillis()
        )
        // Placeholder implementation - will be replaced with actual notification service
        // TODO: Implement notification display
    }
}