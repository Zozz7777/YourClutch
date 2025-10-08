package com.clutch.partners.viewmodel

import androidx.lifecycle.viewModelScope
import com.clutch.partners.data.model.KYCDocument
import com.clutch.partners.data.model.User
import com.clutch.partners.data.repository.AuthRepository
import com.clutch.partners.utils.ErrorHandler
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AuthViewModel @Inject constructor(
    private val authRepository: AuthRepository,
    errorHandler: ErrorHandler
) : BaseViewModel(errorHandler) {
    
    private val _uiState = MutableStateFlow(AuthUiState())
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()
    
    fun testConnection(onResult: (Boolean) -> Unit = {}) {
        println("🔐 AuthViewModel: testConnection called")
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            println("🔐 AuthViewModel: Calling authRepository.testConnection")
            val result = executeWithRetry {
                authRepository.testConnection().getOrThrow()
            }
            
            if (result.isSuccess) {
                println("🔐 AuthViewModel: Connection test successful")
                _uiState.value = _uiState.value.copy(isLoading = false)
                onResult(true)
            } else {
                println("🔐 AuthViewModel: Connection test failed: ${result.exceptionOrNull()?.message}")
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = result.exceptionOrNull()?.message
                )
                onResult(false)
            }
        }
    }
    
    fun signIn(email: String, password: String, onResult: (Boolean) -> Unit = {}) {
        println("🔐 AuthViewModel: signIn called with email: $email")
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            println("🔐 AuthViewModel: Calling authRepository.login")
            val result = executeWithRetry {
                authRepository.login(email, password).getOrThrow()
            }
            
            if (result.isSuccess) {
                println("🔐 AuthViewModel: Login successful for user: ${result.getOrNull()?.email}")
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    user = result.getOrNull(),
                    isAuthenticated = true
                )
                onResult(true)
            } else {
                println("🔐 AuthViewModel: Login failed with error: ${result.exceptionOrNull()?.message}")
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = result.exceptionOrNull()?.message
                )
                onResult(false)
            }
        }
    }
    
    fun signUp(
        partnerId: String,
        email: String,
        phone: String,
        password: String,
        onResult: (Boolean) -> Unit = {}
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            // Call real backend API for sign up (streamlined)
            authRepository.signUp(partnerId, email, phone, password)
                .onSuccess { user ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        user = user,
                        isAuthenticated = true
                    )
                    onResult(true)
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message
                    )
                    onResult(false)
                }
        }
    }
    
    fun requestToJoin(
        businessName: String,
        businessType: String,
        contactName: String,
        email: String,
        phone: String,
        address: String,
        description: String,
        onResult: (Boolean, Boolean) -> Unit = { _, _ -> } // success, isDuplicate
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            // Call real backend API for request to join (this is NOT authentication)
            authRepository.requestToJoin(businessName, businessType, contactName, email, phone, address, description)
                .onSuccess { (success, isDuplicate) -> 
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = null
                    )
                    onResult(success, isDuplicate)
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message
                    )
                    onResult(false, false)
                }
        }
    }
    
    fun uploadKYCDocument(document: KYCDocument) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            // TODO: Implement KYC upload
            Result.success(true)
                .onSuccess {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        kycUploaded = true
                    )
                }
                .onFailure { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message
                    )
                }
        }
    }
    
    fun logout() {
        authRepository.logout()
        _uiState.value = AuthUiState()
    }
    
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
}

data class AuthUiState(
    val isLoading: Boolean = false,
    val user: User? = null,
    val isAuthenticated: Boolean = false,
    val kycUploaded: Boolean = false,
    val error: String? = null
)
