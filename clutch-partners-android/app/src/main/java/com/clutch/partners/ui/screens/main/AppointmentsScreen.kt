package com.clutch.partners.ui.screens.main

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.clutch.partners.navigation.Screen
import com.clutch.partners.ui.components.*
import com.clutch.partners.ui.components.Cards.*
import com.clutch.partners.ui.components.Filters.*
import com.clutch.partners.ui.components.Actions.*
import com.clutch.partners.viewmodel.AppointmentsViewModel
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppointmentsScreen(
    navController: NavController,
    viewModel: AppointmentsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showFilters by remember { mutableStateOf(false) }
    var selectedDate by remember { mutableStateOf(LocalDate.now()) }
    var viewMode by remember { mutableStateOf(AppointmentViewMode.CALENDAR) }
    
    LaunchedEffect(Unit) {
        viewModel.loadAppointments()
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Top App Bar
        TopAppBar(
            title = { 
                Text(
                    text = "Appointments",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            },
            actions = {
                IconButton(onClick = { showFilters = true }) {
                    Icon(
                        imageVector = Icons.Default.FilterList,
                        contentDescription = "Filter"
                    )
                }
                IconButton(onClick = { /* TODO: Navigate to create appointment */ }) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Schedule Appointment"
                    )
                }
            }
        )
        
        // View Mode Toggle
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            FilterChip(
                label = "Calendar",
                isSelected = viewMode == AppointmentViewMode.CALENDAR,
                onClick = { viewMode = AppointmentViewMode.CALENDAR }
            )
            FilterChip(
                label = "List",
                isSelected = viewMode == AppointmentViewMode.LIST,
                onClick = { viewMode = AppointmentViewMode.LIST }
            )
        }
        
        // Quick Stats
        if (uiState.appointments.isNotEmpty()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                StatCard(
                    title = "Today",
                    value = uiState.appointments.count { 
                        it.scheduledDate.toLocalDate() == LocalDate.now() 
                    }.toString(),
                    icon = Icons.Default.Today,
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Pending",
                    value = uiState.appointments.count { it.status.name == "PENDING" }.toString(),
                    icon = Icons.Default.Schedule,
                    iconTint = Color(0xFFFF9800),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Completed",
                    value = uiState.appointments.count { it.status.name == "COMPLETED" }.toString(),
                    icon = Icons.Default.CheckCircle,
                    iconTint = Color(0xFF4CAF50),
                    modifier = Modifier.weight(1f)
                )
            }
        }
        
        // Content based on view mode
        when (viewMode) {
            AppointmentViewMode.CALENDAR -> {
                CalendarView(
                    selectedDate = selectedDate,
                    onDateSelected = { selectedDate = it },
                    appointments = uiState.appointments,
                    onAppointmentClick = { appointmentId ->
                        navController.navigate("appointment_details/$appointmentId")
                    }
                )
            }
            AppointmentViewMode.LIST -> {
                AppointmentsList(
                    appointments = uiState.appointments,
                    isLoading = uiState.isLoading,
                    onAppointmentClick = { appointmentId ->
                        navController.navigate("appointment_details/$appointmentId")
                    },
                    onEdit = { appointmentId ->
                        // TODO: Navigate to edit appointment
                    },
                    onComplete = { appointmentId ->
                        viewModel.updateAppointmentStatus(appointmentId, "COMPLETED")
                    },
                    onCancel = { appointmentId ->
                        viewModel.updateAppointmentStatus(appointmentId, "CANCELLED")
                    }
                )
            }
        }
    }
    
    // Filter Bottom Sheet
    FilterBottomSheet(
        isVisible = showFilters,
        onDismiss = { showFilters = false },
        onApplyFilters = { 
            // TODO: Apply filters
            showFilters = false 
        },
        onClearFilters = { 
            // TODO: Clear filters
        }
    ) {
        // Filter content would go here
        Text("Filter options will be implemented here")
    }
}

@Composable
fun CalendarView(
    selectedDate: LocalDate,
    onDateSelected: (LocalDate) -> Unit,
    appointments: List<com.clutch.partners.data.model.Appointment>,
    onAppointmentClick: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxWidth()
    ) {
        // Date picker would go here
        // For now, we'll show a simple date display
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Calendar View",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Selected: ${selectedDate.format(DateTimeFormatter.ofPattern("MMM dd, yyyy"))}",
                    style = MaterialTheme.typography.bodyMedium
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Appointments: ${appointments.count { it.scheduledDate.toLocalDate() == selectedDate }}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        
        // Appointments for selected date
        val dayAppointments = appointments.filter { 
            it.scheduledDate.toLocalDate() == selectedDate 
        }
        
        if (dayAppointments.isNotEmpty()) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(dayAppointments) { appointment ->
                    AppointmentCard(
                        appointment = appointment,
                        onClick = { onAppointmentClick(appointment.id) }
                    )
                }
            }
        } else {
            EmptyState(
                icon = Icons.Default.Schedule,
                title = "No Appointments",
                description = "No appointments scheduled for this date",
                modifier = Modifier.padding(16.dp)
            )
        }
    }
}

@Composable
fun AppointmentsList(
    appointments: List<com.clutch.partners.data.model.Appointment>,
    isLoading: Boolean,
    onAppointmentClick: (String) -> Unit,
    onEdit: (String) -> Unit,
    onComplete: (String) -> Unit,
    onCancel: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        if (isLoading) {
            items(5) {
                SkeletonCard()
            }
        } else if (appointments.isEmpty()) {
            item {
                EmptyState(
                    icon = Icons.Default.Schedule,
                    title = "No Appointments",
                    description = "You don't have any appointments scheduled",
                    actionText = "Schedule Appointment",
                    onActionClick = { /* TODO: Navigate to create appointment */ }
                )
            }
        } else {
            items(appointments) { appointment ->
                SwipeableAppointmentCard(
                    appointment = appointment,
                    onAppointmentClick = { onAppointmentClick(appointment.id) },
                    onEdit = { onEdit(appointment.id) },
                    onComplete = { onComplete(appointment.id) },
                    onCancel = { onCancel(appointment.id) }
                )
            }
        }
    }
}

@Composable
fun SwipeableAppointmentCard(
    appointment: com.clutch.partners.data.model.Appointment,
    onAppointmentClick: (String) -> Unit,
    onEdit: (String) -> Unit,
    onComplete: (String) -> Unit,
    onCancel: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    // For now, we'll use a simple card without swipe functionality
    // In a real implementation, you would use a swipe-to-reveal library
    Card(
        onClick = { onAppointmentClick(appointment.id) },
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        AppointmentCard(
            appointmentId = appointment.id,
            customerName = appointment.customer.name,
            service = appointment.service,
            scheduledDate = appointment.scheduledDate,
            status = appointment.status.name,
            vehicleInfo = "${appointment.vehicle.make} ${appointment.vehicle.model}",
            onCardClick = { onAppointmentClick(appointment.id) },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

enum class AppointmentViewMode {
    CALENDAR,
    LIST
}
