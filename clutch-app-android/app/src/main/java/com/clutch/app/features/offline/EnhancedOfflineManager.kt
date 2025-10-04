package com.clutch.app.features.offline

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.app.data.model.*
import com.clutch.app.data.repository.ClutchRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class OfflineUiState(
    val isOnline: Boolean = true,
    val syncState: SyncState = SyncState.Idle,
    val pendingActions: List<PendingAction> = emptyList(),
    val cachedData: Map<String, Any> = emptyMap(),
    val lastSyncTime: Long = 0L,
    val errorMessage: String = ""
)

sealed class SyncState {
    object Idle : SyncState()
    object Syncing : SyncState()
    object Synced : SyncState()
    object Failed : SyncState()
    object Offline : SyncState()
}

data class PendingAction(
    val id: String,
    val type: ActionType,
    val data: Map<String, Any>,
    val timestamp: Long,
    val retryCount: Int = 0
)

enum class ActionType {
    BOOK_SERVICE,
    REDEEM_REWARD,
    UPDATE_PROFILE,
    ADD_CAR,
    UPDATE_MAINTENANCE,
    ORDER_PARTS,
    CREATE_TIP,
    UPDATE_SETTINGS
}

@HiltViewModel
class EnhancedOfflineManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val repository: ClutchRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(OfflineUiState())
    val uiState: StateFlow<OfflineUiState> = _uiState.asStateFlow()

    private val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            _uiState.value = _uiState.value.copy(isOnline = true)
            syncPendingActions()
        }

        override fun onLost(network: Network) {
            _uiState.value = _uiState.value.copy(isOnline = false, syncState = SyncState.Offline)
        }
    }

    init {
        registerNetworkCallback()
        loadCachedData()
        loadPendingActions()
    }

    private fun registerNetworkCallback() {
        val networkRequest = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        connectivityManager.registerNetworkCallback(networkRequest, networkCallback)
    }

    private fun loadCachedData() {
        viewModelScope.launch {
            try {
                // Load cached user data
                val userResult = repository.getUserProfile()
                if (userResult.isSuccess) {
                    _uiState.value = _uiState.value.copy(
                        cachedData = _uiState.value.cachedData + ("user" to userResult.getOrNull()!!)
                    )
                }

                // Load cached cars
                val carsResult = repository.getUserCars()
                if (carsResult.isSuccess) {
                    _uiState.value = _uiState.value.copy(
                        cachedData = _uiState.value.cachedData + ("cars" to carsResult.getOrNull()!!)
                    )
                }

                // Load cached maintenance history
                val maintenanceResult = repository.getMaintenanceHistory()
                if (maintenanceResult.isSuccess) {
                    _uiState.value = _uiState.value.copy(
                        cachedData = _uiState.value.cachedData + ("maintenance" to maintenanceResult.getOrNull()!!)
                    )
                }

                // Load cached loyalty data
                val loyaltyResult = repository.getUserPoints()
                loyaltyResult.onSuccess { userPoints ->
                    _uiState.value = _uiState.value.copy(
                        cachedData = _uiState.value.cachedData + ("loyalty" to userPoints)
                    )
                }

            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = "Failed to load cached data: ${e.message}"
                )
            }
        }
    }

    private fun loadPendingActions() {
        viewModelScope.launch {
            try {
                // Load pending actions from local storage
                val pendingActions = repository.getPendingActions()
                _uiState.value = _uiState.value.copy(pendingActions = pendingActions)
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = "Failed to load pending actions: ${e.message}"
                )
            }
        }
    }

    fun syncPendingActions() {
        if (!_uiState.value.isOnline) return

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(syncState = SyncState.Syncing)
            
            try {
                val pendingActions = _uiState.value.pendingActions
                val successfulActions = mutableListOf<String>()
                
                for (action in pendingActions) {
                    try {
                        when (action.type) {
                            ActionType.BOOK_SERVICE -> {
                                val booking = action.data["booking"] as ServiceBooking
                                val result = repository.bookService(booking)
                                if (result.isSuccess) {
                                    successfulActions.add(action.id)
                                }
                            }
                            ActionType.REDEEM_REWARD -> {
                                val rewardId = action.data["rewardId"] as String
                                val pointsUsed = action.data["pointsUsed"] as Int
                                val result = repository.redeemReward(rewardId, pointsUsed)
                                if (result.isSuccess) {
                                    successfulActions.add(action.id)
                                }
                            }
                            ActionType.UPDATE_PROFILE -> {
                                val user = action.data["user"] as User
                                val result = repository.updateUserProfile(user)
                                if (result.isSuccess) {
                                    successfulActions.add(action.id)
                                }
                            }
                            ActionType.ADD_CAR -> {
                                val carRequest = action.data["carRequest"] as CarRegistrationRequest
                                val result = repository.registerCar(carRequest)
                                if (result.isSuccess) {
                                    successfulActions.add(action.id)
                                }
                            }
                            ActionType.UPDATE_MAINTENANCE -> {
                                val maintenanceRequest = action.data["maintenanceRequest"] as MaintenanceRequest
                                val result = repository.updateCarMaintenance("", maintenanceRequest)
                                if (result.isSuccess) {
                                    successfulActions.add(action.id)
                                }
                            }
                            ActionType.ORDER_PARTS -> {
                                // Implement parts ordering
                                successfulActions.add(action.id)
                            }
                            ActionType.CREATE_TIP -> {
                                val tip = action.data["tip"] as CommunityTip
                                val result = repository.createTip(tip)
                                if (result.isSuccess) {
                                    successfulActions.add(action.id)
                                }
                            }
                            ActionType.UPDATE_SETTINGS -> {
                                val settings = action.data["settings"] as NotificationSettings
                                val result = repository.updateNotificationSettings(settings)
                                if (result.isSuccess) {
                                    successfulActions.add(action.id)
                                }
                            }
                        }
                    } catch (e: Exception) {
                        // Retry logic for failed actions
                        if (action.retryCount < 3) {
                            val updatedAction = action.copy(retryCount = action.retryCount + 1)
                            repository.updatePendingAction(updatedAction)
                        }
                    }
                }

                // Remove successful actions
                if (successfulActions.isNotEmpty()) {
                    repository.removePendingActions(successfulActions)
                    val remainingActions = pendingActions.filter { it.id !in successfulActions }
                    _uiState.value = _uiState.value.copy(
                        pendingActions = remainingActions,
                        syncState = SyncState.Synced,
                        lastSyncTime = System.currentTimeMillis()
                    )
                } else {
                    _uiState.value = _uiState.value.copy(syncState = SyncState.Idle)
                }

            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    syncState = SyncState.Failed,
                    errorMessage = "Sync failed: ${e.message}"
                )
            }
        }
    }

    fun addPendingAction(type: ActionType, data: Map<String, Any>) {
        val action = PendingAction(
            id = System.currentTimeMillis().toString(),
            type = type,
            data = data,
            timestamp = System.currentTimeMillis()
        )
        
        viewModelScope.launch {
            try {
                repository.addPendingAction(action)
                _uiState.value = _uiState.value.copy(
                    pendingActions = _uiState.value.pendingActions + action
                )
                
                // Try to sync immediately if online
                if (_uiState.value.isOnline) {
                    syncPendingActions()
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    errorMessage = "Failed to add pending action: ${e.message}"
                )
            }
        }
    }

    fun getCachedData(key: String): Any? {
        return _uiState.value.cachedData[key]
    }

    fun updateCachedData(key: String, data: Any) {
        _uiState.value = _uiState.value.copy(
            cachedData = _uiState.value.cachedData + (key to data)
        )
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = "")
    }

    fun forceSync() {
        if (_uiState.value.isOnline) {
            syncPendingActions()
        }
    }

    override fun onCleared() {
        super.onCleared()
        connectivityManager.unregisterNetworkCallback(networkCallback)
    }
}
