package com.clutch.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.app.data.model.CarModel
import com.clutch.app.data.repository.ClutchRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ModelSelectionViewModel @Inject constructor(
    private val repository: ClutchRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ModelSelectionUiState())
    val uiState: StateFlow<ModelSelectionUiState> = _uiState.asStateFlow()

    fun loadModels(brandName: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            
            try {
                val result = repository.getCarModels(brandName)
                result.fold(
                    onSuccess = { models ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            models = models,
                            filteredModels = models,
                            errorMessage = null
                        )
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = error.message ?: "Failed to load models"
                        )
                    }
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = e.message ?: "Failed to load models"
                )
            }
        }
    }

    fun searchModels(query: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(searchQuery = query)
            
            val currentModels = _uiState.value.models
            val filteredModels = if (query.isBlank()) {
                currentModels
            } else {
                currentModels.filter { model ->
                    model.name.contains(query, ignoreCase = true)
                }
            }
            
            _uiState.value = _uiState.value.copy(filteredModels = filteredModels)
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = null)
    }
}

data class ModelSelectionUiState(
    val isLoading: Boolean = false,
    val models: List<CarModel> = emptyList(),
    val filteredModels: List<CarModel> = emptyList(),
    val searchQuery: String = "",
    val errorMessage: String? = null
)
