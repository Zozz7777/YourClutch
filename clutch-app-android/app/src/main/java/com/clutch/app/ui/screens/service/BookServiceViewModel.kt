package com.clutch.app.ui.screens.service

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.clutch.app.data.model.ServiceBooking
import com.clutch.app.data.model.ServiceCategory
import com.clutch.app.data.model.ServiceProvider
import com.clutch.app.data.repository.ClutchRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class BookServiceUiState(
    val isLoading: Boolean = false,
    val serviceCategories: List<ServiceCategory> = emptyList(),
    val selectedCategory: ServiceCategory? = null,
    val serviceProviders: List<ServiceProvider> = emptyList(),
    val selectedProvider: ServiceProvider? = null,
    val selectedDate: String? = null,
    val selectedTime: String? = null,
    val bookingNotes: String = "",
    val isBookingSuccess: Boolean = false,
    val errorMessage: String = ""
)

@HiltViewModel
class BookServiceViewModel @Inject constructor(
    private val repository: ClutchRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(BookServiceUiState())
    val uiState: StateFlow<BookServiceUiState> = _uiState.asStateFlow()

    init {
        loadServiceCategories()
    }

    fun loadServiceCategories() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = "")
            try {
                val categories = repository.getServiceCategories()
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    serviceCategories = categories
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Failed to load service categories: ${e.message}"
                )
            }
        }
    }

    fun selectServiceCategory(category: ServiceCategory) {
        _uiState.value = _uiState.value.copy(selectedCategory = category)
        loadServiceProviders(category.id)
    }

    fun loadServiceProviders(categoryId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = "")
            try {
                val providers = repository.getServiceProviders(categoryId)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    serviceProviders = providers
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Failed to load service providers: ${e.message}"
                )
            }
        }
    }

    fun selectServiceProvider(provider: ServiceProvider) {
        _uiState.value = _uiState.value.copy(selectedProvider = provider)
    }

    fun selectDateTime(date: String, time: String) {
        _uiState.value = _uiState.value.copy(
            selectedDate = date,
            selectedTime = time
        )
    }

    fun updateBookingNotes(notes: String) {
        _uiState.value = _uiState.value.copy(bookingNotes = notes)
    }

    fun bookService() {
        val currentState = _uiState.value
        if (currentState.selectedCategory == null || 
            currentState.selectedProvider == null || 
            currentState.selectedDate == null || 
            currentState.selectedTime == null) {
            _uiState.value = _uiState.value.copy(
                errorMessage = "Please complete all booking details"
            )
            return
        }

        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = "")
            try {
                val booking = ServiceBooking(
                    id = "",
                    userId = repository.getCurrentUserId(),
                    serviceCategoryId = currentState.selectedCategory!!.id,
                    serviceProviderId = currentState.selectedProvider!!.id,
                    scheduledDate = currentState.selectedDate!!,
                    scheduledTime = currentState.selectedTime!!,
                    notes = currentState.bookingNotes,
                    status = "pending",
                    totalPrice = currentState.selectedCategory!!.basePrice
                )
                
                val result = repository.bookService(booking)
                if (result.isSuccess) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        isBookingSuccess = true
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = result.exceptionOrNull()?.message ?: "Booking failed"
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMessage = "Booking failed: ${e.message}"
                )
            }
        }
    }

    fun clearError() {
        _uiState.value = _uiState.value.copy(errorMessage = "")
    }

    fun resetBooking() {
        _uiState.value = BookServiceUiState()
        loadServiceCategories()
    }
}
