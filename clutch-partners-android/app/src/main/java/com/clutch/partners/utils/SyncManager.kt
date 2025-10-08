package com.clutch.partners.utils

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SyncManager @Inject constructor(
    private val networkStateManager: NetworkStateManager
) {
    
    private val _isSyncing = MutableStateFlow(false)
    val isSyncing: StateFlow<Boolean> = _isSyncing.asStateFlow()
    
    private val _lastSyncTime = MutableStateFlow<Long?>(null)
    val lastSyncTime: StateFlow<Long?> = _lastSyncTime.asStateFlow()
    
    private val _pendingOperations = MutableStateFlow<List<PendingOperation>>(emptyList())
    val pendingOperations: StateFlow<List<PendingOperation>> = _pendingOperations.asStateFlow()
    
    /**
     * Add operation to pending queue when offline
     */
    fun addPendingOperation(operation: PendingOperation) {
        val currentList = _pendingOperations.value.toMutableList()
        currentList.add(operation)
        _pendingOperations.value = currentList
    }
    
    /**
     * Remove operation from pending queue after successful sync
     */
    fun removePendingOperation(operationId: String) {
        val currentList = _pendingOperations.value.toMutableList()
        currentList.removeAll { it.id == operationId }
        _pendingOperations.value = currentList
    }
    
    /**
     * Clear all pending operations
     */
    fun clearPendingOperations() {
        _pendingOperations.value = emptyList()
    }
    
    /**
     * Start sync process
     */
    suspend fun startSync() {
        if (!networkStateManager.isNetworkAvailable()) {
            return
        }
        
        _isSyncing.value = true
        
        try {
            // Process all pending operations
            val operations = _pendingOperations.value.toList()
            for (operation in operations) {
                try {
                    operation.execute()
                    removePendingOperation(operation.id)
                } catch (e: Exception) {
                    // Keep operation in pending list if it fails
                    continue
                }
            }
            
            _lastSyncTime.value = System.currentTimeMillis()
        } finally {
            _isSyncing.value = false
        }
    }
    
    /**
     * Check if sync is needed
     */
    fun isSyncNeeded(): Boolean {
        val lastSync = _lastSyncTime.value
        val now = System.currentTimeMillis()
        
        return if (lastSync == null) {
            true
        } else {
            // Sync if more than 5 minutes have passed
            (now - lastSync) > 5 * 60 * 1000
        }
    }
    
    /**
     * Get pending operations count
     */
    fun getPendingOperationsCount(): Int {
        return _pendingOperations.value.size
    }
}

data class PendingOperation(
    val id: String,
    val type: OperationType,
    val data: Map<String, Any>,
    val timestamp: Long = System.currentTimeMillis(),
    val execute: suspend () -> Unit
)

enum class OperationType {
    CREATE_APPOINTMENT,
    UPDATE_APPOINTMENT,
    DELETE_APPOINTMENT,
    CREATE_QUOTATION,
    UPDATE_QUOTATION,
    DELETE_QUOTATION,
    CREATE_INVENTORY_ITEM,
    UPDATE_INVENTORY_ITEM,
    DELETE_INVENTORY_ITEM,
    UPDATE_PROFILE,
    UPDATE_WORKING_HOURS
}
