package com.clutch.partners.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.partners.data.model.ApprovalRequest
import com.clutch.partners.data.repository.ApprovalsRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class ApprovalsUiState(
    val isLoading: Boolean = false,
    val pendingApprovals: List<ApprovalRequest> = emptyList(),
    val myApprovalRequests: List<ApprovalRequest> = emptyList(),
    val error: String? = null,
    val successMessage: String? = null
)

class ApprovalsViewModel(
    private val approvalsRepository: ApprovalsRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ApprovalsUiState())
    val uiState: StateFlow<ApprovalsUiState> = _uiState.asStateFlow()

    private val _currentLanguage = MutableStateFlow("en")
    val currentLanguage: StateFlow<String> = _currentLanguage.asStateFlow()

    fun loadPendingApprovals() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val approvals = approvalsRepository.getPendingApprovals()
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    pendingApprovals = approvals
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to load pending approvals"
                )
            }
        }
    }

    fun loadMyApprovalRequests() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val requests = approvalsRepository.getMyApprovalRequests()
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    myApprovalRequests = requests
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to load your approval requests"
                )
            }
        }
    }

    fun approveRequest(approvalId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                approvalsRepository.approveRequest(approvalId)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    successMessage = "Request approved successfully"
                )
                // Reload pending approvals
                loadPendingApprovals()
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to approve request"
                )
            }
        }
    }

    fun rejectRequest(approvalId: String, reason: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                approvalsRepository.rejectRequest(approvalId, reason)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    successMessage = "Request rejected"
                )
                // Reload pending approvals
                loadPendingApprovals()
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = e.message ?: "Failed to reject request"
                )
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }

    fun clearSuccessMessage() {
        _uiState.value = _uiState.value.copy(successMessage = null)
    }

    fun setLanguage(language: String) {
        _currentLanguage.value = language
    }
}
