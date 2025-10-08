package com.clutch.partners.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.partners.utils.ErrorHandler
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

abstract class BaseViewModel @Inject constructor(
    protected val errorHandler: ErrorHandler
) : ViewModel() {
    
    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()
    
    private val _error = MutableStateFlow<Throwable?>(null)
    val error: StateFlow<Throwable?> = _error.asStateFlow()
    
    private val _retryCount = MutableStateFlow(0)
    val retryCount: StateFlow<Int> = _retryCount.asStateFlow()
    
    protected fun setLoading(loading: Boolean) {
        _isLoading.value = loading
    }
    
    protected fun setError(error: Throwable?) {
        _error.value = error
    }
    
    protected fun clearError() {
        _error.value = null
    }
    
    protected fun incrementRetryCount() {
        _retryCount.value++
    }
    
    protected fun resetRetryCount() {
        _retryCount.value = 0
    }
    
    /**
     * Execute operation with retry logic and error handling
     */
    protected suspend fun <T> executeWithRetry(
        maxRetries: Int = 3,
        operation: suspend () -> T
    ): Result<T> {
        setLoading(true)
        clearError()
        
        return try {
            val result = errorHandler.retryWithNetworkCheck(
                maxRetries = maxRetries,
                operation = operation
            )
            
            if (result.isSuccess) {
                resetRetryCount()
                setLoading(false)
            } else {
                setError(result.exceptionOrNull())
                setLoading(false)
            }
            
            result
        } catch (e: Exception) {
            setError(e)
            setLoading(false)
            Result.failure(e)
        }
    }
    
    /**
     * Execute operation with manual retry capability
     */
    protected suspend fun <T> executeWithManualRetry(
        operation: suspend () -> T
    ): Result<T> {
        setLoading(true)
        clearError()
        
        return try {
            val result = operation()
            resetRetryCount()
            setLoading(false)
            Result.success(result)
        } catch (e: Exception) {
            setError(e)
            setLoading(false)
            Result.failure(e)
        }
    }
    
    /**
     * Retry the last failed operation
     */
    fun retry() {
        incrementRetryCount()
        clearError()
        // Subclasses should override this to implement specific retry logic
    }
    
    /**
     * Dismiss error
     */
    fun dismissError() {
        clearError()
    }
    
    /**
     * Check if error is retryable
     */
    fun isErrorRetryable(): Boolean {
        return error.value?.let { errorHandler.isRetryableError(it) } ?: false
    }
    
    /**
     * Get user-friendly error message
     */
    fun getErrorMessage(currentLanguage: String = "en"): String? {
        return error.value?.let { errorHandler.getErrorMessage(it, currentLanguage) }
    }
}
