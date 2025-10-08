package com.clutch.partners.ui.screens.appointments

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.clutch.partners.ClutchPartnersTheme
import com.clutch.partners.data.model.*
import com.clutch.partners.ui.components.*
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
    var selectedDate by remember { mutableStateOf(LocalDate.now()) }
    var selectedStatus by remember { mutableStateOf<String?>(null) }
    var showFilters by remember { mutableStateOf(false) }
    
    LaunchedEffect(selectedDate, selectedStatus) {
        viewModel.loadAppointments(
            status = selectedStatus,
            date = selectedDate.format(DateTimeFormatter.ISO_LOCAL_DATE)
        )
    }
    
    ClutchPartnersTheme {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Top App Bar
            TopAppBar(
                title = { Text("Appointments") },
                actions = {
                    IconButton(onClick = { showFilters = !showFilters }) {
                        Icon(Icons.Default.FilterList, contentDescription = "Filters")
                    }
                    IconButton(onClick = { navController.navigate("create_appointment") }) {
                        Icon(Icons.Default.Add, contentDescription = "Add Appointment")
                    }
                }
            )
            
            // Filters Section
            if (showFilters) {
                FiltersSection(
                    selectedDate = selectedDate,
                    selectedStatus = selectedStatus,
                    onDateChange = { selectedDate = it },
                    onStatusChange = { selectedStatus = it },
                    onClearFilters = { 
                        selectedDate = LocalDate.now()
                        selectedStatus = null
                    }
                )
            }
            
            // Content
            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    LoadingIndicator(message = "Loading appointments...")
                }
            } else if (uiState.appointments.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    EmptyAppointmentsState(
                        onAddAppointment = { navController.navigate("create_appointment") }
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Group appointments by date
                    val groupedAppointments = uiState.appointments.groupBy { appointment ->
                        appointment.scheduledDate.toLocalDate()
                    }
                    
                    groupedAppointments.forEach { (date, appointments) ->
                        item {
                            DateHeader(date = date)
                        }
                        
                        items(appointments) { appointment ->
                            AppointmentCard(
                                appointment = appointment,
                                onClick = { navController.navigate("appointment_details/${appointment.id}") }
                            )
                        }
                    }
                }
            }
            
            // Error handling
            uiState.error?.let { error ->
                ErrorHandler(
                    error = error,
                    onRetry = { 
                        viewModel.clearError()
                        viewModel.loadAppointments(selectedStatus, selectedDate.format(DateTimeFormatter.ISO_LOCAL_DATE))
                    },
                    onDismiss = { viewModel.clearError() }
                )
            }
        }
    }
}

@Composable
fun FiltersSection(
    selectedDate: LocalDate,
    selectedStatus: String?,
    onDateChange: (LocalDate) -> Unit,
    onStatusChange: (String?) -> Unit,
    onClearFilters: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Filters",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            // Date Filter
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Date:",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                Button(
                    onClick = { onDateChange(LocalDate.now()) },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (selectedDate == LocalDate.now()) 
                            MaterialTheme.colorScheme.primary 
                        else MaterialTheme.colorScheme.surface
                    )
                ) {
                    Text("Today")
                }
                
                Button(
                    onClick = { onDateChange(LocalDate.now().plusDays(1)) },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (selectedDate == LocalDate.now().plusDays(1)) 
                            MaterialTheme.colorScheme.primary 
                        else MaterialTheme.colorScheme.surface
                    )
                ) {
                    Text("Tomorrow")
                }
            }
            
            // Status Filter
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Status:",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                val statuses = listOf("scheduled", "confirmed", "in_progress", "completed", "cancelled")
                statuses.forEach { status ->
                    FilterChip(
                        onClick = { onStatusChange(if (selectedStatus == status) null else status) },
                        label = { Text(status.replace("_", " ").uppercase()) },
                        selected = selectedStatus == status
                    )
                }
            }
            
            // Clear Filters
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                TextButton(onClick = onClearFilters) {
                    Text("Clear All")
                }
            }
        }
    }
}

@Composable
fun DateHeader(date: LocalDate) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Text(
            text = date.format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy")),
            modifier = Modifier.padding(16.dp),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onPrimaryContainer
        )
    }
}

@Composable
fun AppointmentCard(
    appointment: Appointment,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = appointment.customer.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                AppointmentStatusBadge(
                    status = appointment.status.name,
                    modifier = Modifier
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = appointment.service,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Time: ${appointment.scheduledDate.format(DateTimeFormatter.ofPattern("HH:mm"))}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                if (appointment.isUrgent) {
                    PriorityBadge(
                        priority = "high",
                        modifier = Modifier
                    )
                }
            }
            
            appointment.vehicle?.let { vehicle ->
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = "Vehicle: ${vehicle.make} ${vehicle.model} ${vehicle.year}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            appointment.notes?.let { notes ->
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = "Notes: $notes",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
