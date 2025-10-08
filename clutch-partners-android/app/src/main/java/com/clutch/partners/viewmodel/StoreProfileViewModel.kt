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
class StoreProfileViewModel @Inject constructor(
    private val apiService: ApiService,
    private val authService: AuthService
) : ViewModel() {

    private val _uiState = MutableStateFlow(StoreProfileUiState())
    val uiState: StateFlow<StoreProfileUiState> = _uiState.asStateFlow()

    fun loadStoreProfile() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val token = authService.getAuthToken() ?: return
                val result = apiService.getStoreProfile(token)
                
                result.fold(
                    onSuccess = { profile ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            storeProfile = profile,
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

    fun updateStoreProfile(update: StoreProfileUpdate) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val token = authService.getAuthToken() ?: return
                val result = apiService.updateStoreProfile(update, token)
                
                result.fold(
                    onSuccess = { updatedProfile ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            storeProfile = updatedProfile,
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

    fun updateWorkingHours(workingHours: WorkingHours) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val token = authService.getAuthToken() ?: return
                val update = StoreProfileUpdate(workingHours = workingHours)
                val result = apiService.updateStoreProfile(update, token)
                
                result.fold(
                    onSuccess = { updatedProfile ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            storeProfile = updatedProfile,
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

    fun updateServices(services: List<String>) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val token = authService.getAuthToken() ?: return
                val update = StoreProfileUpdate(services = services)
                val result = apiService.updateStoreProfile(update, token)
                
                result.fold(
                    onSuccess = { updatedProfile ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            storeProfile = updatedProfile,
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

    fun updateBusinessAddress(address: BusinessAddress) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val token = authService.getAuthToken() ?: return
                val update = StoreProfileUpdate(businessAddress = address)
                val result = apiService.updateStoreProfile(update, token)
                
                result.fold(
                    onSuccess = { updatedProfile ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            storeProfile = updatedProfile,
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

    fun updateBusinessSettings(settings: BusinessSettings) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val token = authService.getAuthToken() ?: return
                val update = StoreProfileUpdate(businessSettings = settings)
                val result = apiService.updateStoreProfile(update, token)
                
                result.fold(
                    onSuccess = { updatedProfile ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            storeProfile = updatedProfile,
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

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}

data class StoreProfileUiState(
    val isLoading: Boolean = false,
    val storeProfile: StoreProfile? = null,
    val error: String? = null
)
