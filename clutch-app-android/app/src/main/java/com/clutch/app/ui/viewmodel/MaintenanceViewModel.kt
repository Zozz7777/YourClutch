package com.clutch.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.app.data.model.MaintenanceType
import com.clutch.app.data.repository.ClutchRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MaintenanceViewModel @Inject constructor(
    private val repository: ClutchRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(MaintenanceUiState())
    val uiState: StateFlow<MaintenanceUiState> = _uiState.asStateFlow()

    fun loadMaintenanceTypes() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            
            try {
                val result = repository.getMaintenanceTypes()
                result.fold(
                    onSuccess = { maintenanceTypes ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            maintenanceTypes = maintenanceTypes,
                            errorMessage = null
                        )
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = error.message ?: "Failed to load maintenance types"
                        )
                    }
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.message ?: "Unknown error occurred"
                )
            }
        }
    }

    fun submitMaintenanceRecord(
        date: String,
        maintenanceType: String,
        kilometers: String,
        description: String? = null
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSubmitting = true, errorMessage = null)
            
            try {
                val result = repository.submitMaintenanceRecord(
                    date = date,
                    maintenanceType = maintenanceType,
                    kilometers = kilometers.toIntOrNull() ?: 0,
                    description = description
                )
                result.fold(
                    onSuccess = { maintenanceRecord ->
                        _uiState.value = _uiState.value.copy(
                            isSubmitting = false,
                            isSuccess = true,
                            errorMessage = null
                        )
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isSubmitting = false,
                            errorMessage = error.message ?: "Failed to submit maintenance record"
                        )
                    }
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isSubmitting = false,
                    errorMessage = e.message ?: "Unknown error occurred"
                )
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }

    fun clearSuccess() {
        _uiState.value = _uiState.value.copy(isSuccess = false)
    }
}

data class MaintenanceUiState(
    val isLoading: Boolean = false,
    val isSubmitting: Boolean = false,
    val isSuccess: Boolean = false,
    val maintenanceTypes: List<MaintenanceType> = emptyList(),
    val errorMessage: String? = null
)
