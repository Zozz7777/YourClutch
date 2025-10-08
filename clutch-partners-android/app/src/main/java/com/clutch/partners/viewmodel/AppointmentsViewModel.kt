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
class AppointmentsViewModel @Inject constructor(
    private val apiService: ApiService,
    private val authService: AuthService
) : ViewModel() {

    private val _uiState = MutableStateFlow(AppointmentsUiState())
    val uiState: StateFlow<AppointmentsUiState> = _uiState.asStateFlow()

    fun loadAppointments(
        status: String? = null,
        date: String? = null,
        page: Int = 1,
        limit: Int = 20
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val token = authService.getAuthToken() ?: return
                val result = apiService.getAppointments(status, date, page, limit, token)
                
                result.fold(
                    onSuccess = { (appointments, pagination) ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            appointments = appointments,
                            pagination = pagination,
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

    fun loadAppointmentDetails(appointmentId: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val token = authService.getAuthToken() ?: return
                val result = apiService.getAppointmentDetails(appointmentId, token)
                
                result.fold(
                    onSuccess = { appointment ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            selectedAppointment = appointment,
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

    fun createAppointment(appointmentRequest: AppointmentRequest) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val token = authService.getAuthToken() ?: return
                val result = apiService.createAppointment(appointmentRequest, token)
                
                result.fold(
                    onSuccess = { appointment ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            appointments = _uiState.value.appointments + appointment,
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

    fun updateAppointmentStatus(
        appointmentId: String,
        status: AppointmentStatus,
        notes: String? = null,
        estimatedTime: String? = null
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val token = authService.getAuthToken() ?: return
                val result = apiService.updateAppointmentStatus(appointmentId, status, notes, estimatedTime, token)
                
                result.fold(
                    onSuccess = { updatedAppointment ->
                        val updatedList = _uiState.value.appointments.map { appointment ->
                            if (appointment.id == appointmentId) updatedAppointment else appointment
                        }
                        
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            appointments = updatedList,
                            selectedAppointment = if (_uiState.value.selectedAppointment?.id == appointmentId) {
                                updatedAppointment
                            } else {
                                _uiState.value.selectedAppointment
                            },
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

    fun clearSelectedAppointment() {
        _uiState.value = _uiState.value.copy(selectedAppointment = null)
    }
}

data class AppointmentsUiState(
    val isLoading: Boolean = false,
    val appointments: List<Appointment> = emptyList(),
    val selectedAppointment: Appointment? = null,
    val pagination: Pagination? = null,
    val error: String? = null
)
