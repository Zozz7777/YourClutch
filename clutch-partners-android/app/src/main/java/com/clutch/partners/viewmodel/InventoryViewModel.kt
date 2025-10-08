package com.clutch.partners.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.partners.data.model.*
import com.clutch.partners.data.service.ApiService
import com.clutch.partners.data.service.AuthService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class InventoryViewModel @Inject constructor(
    private val apiService: ApiService,
    private val authService: AuthService
) : ViewModel() {

    private val _uiState = MutableStateFlow(InventoryUiState())
    val uiState: StateFlow<InventoryUiState> = _uiState.asStateFlow()

    fun loadInventory(
        category: String? = null,
        status: String? = null,
        search: String? = null,
        page: Int = 1,
        limit: Int = 20
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val token = authService.getAuthToken() ?: return
                val result = apiService.getInventory(category, status, search, page, limit, token)
                
                result.fold(
                    onSuccess = { inventoryResponse ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            inventory = inventoryResponse.inventory,
                            pagination = inventoryResponse.pagination,
                            error = null
                        )
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = error.message
                        )
                    }
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message
                )
            }
        }
    }

    fun addInventoryItem(inventoryRequest: InventoryRequest) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val token = authService.getAuthToken() ?: return
                val result = apiService.addInventoryItem(inventoryRequest, token)
                
                result.fold(
                    onSuccess = { item ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            inventory = _uiState.value.inventory + item,
                            error = null
                        )
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = error.message
                        )
                    }
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message
                )
            }
        }
    }

    fun updateInventoryItem(itemId: String, update: InventoryUpdate) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val token = authService.getAuthToken() ?: return
                val result = apiService.updateInventoryItem(itemId, update, token)
                
                result.fold(
                    onSuccess = { updatedItem ->
                        val updatedList = _uiState.value.inventory.map { item ->
                            if (item.id == itemId) updatedItem else item
                        }
                        
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            inventory = updatedList,
                            error = null
                        )
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = error.message
                        )
                    }
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message
                )
            }
        }
    }

    fun searchInventory(query: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val token = authService.getAuthToken() ?: return
                val result = apiService.getInventory(search = query, token = token)
                
                result.fold(
                    onSuccess = { inventoryResponse ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            inventory = inventoryResponse.inventory,
                            pagination = inventoryResponse.pagination,
                            error = null
                        )
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = error.message
                        )
                    }
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message
                )
            }
        }
    }

    fun filterInventory(category: String?, status: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val token = authService.getAuthToken() ?: return
                val result = apiService.getInventory(category, status, null, 1, 20, token)
                
                result.fold(
                    onSuccess = { inventoryResponse ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            inventory = inventoryResponse.inventory,
                            pagination = inventoryResponse.pagination,
                            error = null
                        )
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = error.message
                        )
                    }
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message
                )
            }
        }
    }

    fun getLowStockItems(): List<InventoryItem> {
        return _uiState.value.inventory.filter { it.isLowStock }
    }

    fun getOutOfStockItems(): List<InventoryItem> {
        return _uiState.value.inventory.filter { it.isOutOfStock }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}

data class InventoryUiState(
    val isLoading: Boolean = false,
    val inventory: List<InventoryItem> = emptyList(),
    val pagination: Pagination? = null,
    val error: String? = null
)
