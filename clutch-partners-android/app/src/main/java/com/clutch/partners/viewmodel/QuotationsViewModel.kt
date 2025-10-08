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
import java.util.Date
import javax.inject.Inject

@HiltViewModel
class QuotationsViewModel @Inject constructor(
    private val apiService: ApiService,
    private val authService: AuthService
) : ViewModel() {

    private val _uiState = MutableStateFlow(QuotationsUiState())
    val uiState: StateFlow<QuotationsUiState> = _uiState.asStateFlow()

    fun loadQuotations(
        status: String? = null,
        page: Int = 1,
        limit: Int = 20
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val token = authService.getAuthToken() ?: return
                val result = apiService.getQuotations(status, page, limit, token)
                
                result.fold(
                    onSuccess = { quotationResponse ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            quotations = quotationResponse.quotations,
                            pagination = quotationResponse.pagination,
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

    fun createQuotation(quotationRequest: QuotationRequest) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val token = authService.getAuthToken() ?: return
                val result = apiService.createQuotation(quotationRequest, token)
                
                result.fold(
                    onSuccess = { quotation ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            quotations = _uiState.value.quotations + quotation,
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

    fun filterQuotations(status: String?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val token = authService.getAuthToken() ?: return
                val result = apiService.getQuotations(status, 1, 20, token)
                
                result.fold(
                    onSuccess = { quotationResponse ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            quotations = quotationResponse.quotations,
                            pagination = quotationResponse.pagination,
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

data class QuotationsUiState(
    val isLoading: Boolean = false,
    val quotations: List<Quotation> = emptyList(),
    val pagination: Pagination? = null,
    val error: String? = null
)
