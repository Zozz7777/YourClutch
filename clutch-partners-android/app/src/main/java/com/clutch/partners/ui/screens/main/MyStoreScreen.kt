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
import com.clutch.partners.ui.components.Forms.*
import com.clutch.partners.ui.components.Actions.*
import com.clutch.partners.viewmodel.StoreProfileViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyStoreScreen(
    navController: NavController,
    viewModel: StoreProfileViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showWorkingHoursEditor by remember { mutableStateOf(false) }
    var showBusinessSettings by remember { mutableStateOf(false) }
    
    LaunchedEffect(Unit) {
        viewModel.loadStoreProfile()
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
                    text = "My Store",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            },
            actions = {
                IconButton(onClick = { /* Edit profile */ }) {
                    Icon(Icons.Default.Edit, contentDescription = "Edit Profile")
                }
            }
        )
        
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Store Overview Card
            item {
                StoreOverviewCard(
                    storeName = uiState.storeProfile?.businessName ?: "Loading...",
                    partnerType = uiState.storeProfile?.partnerType?.name ?: "Loading...",
                    status = uiState.storeProfile?.status?.name ?: "Loading...",
                    onEditClick = { /* Navigate to edit store */ }
                )
            }
            
            // Quick Actions
            item {
                Text(
                    text = "Quick Actions",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )
            }
            
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    QuickAction(
                        icon = Icons.Default.Schedule,
                        label = "Working Hours",
                        onClick = { showWorkingHoursEditor = true },
                        modifier = Modifier.weight(1f)
                    )
                    QuickAction(
                        icon = Icons.Default.Settings,
                        label = "Business Settings",
                        onClick = { showBusinessSettings = true },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    QuickAction(
                        icon = Icons.Default.Info,
                        label = "Business Info",
                        onClick = { /* Navigate to business info */ },
                        modifier = Modifier.weight(1f)
                    )
                    QuickAction(
                        icon = Icons.Default.Notifications,
                        label = "Notifications",
                        onClick = { /* Navigate to notifications */ },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            
            // Business Information
            item {
                FormSection(
                    title = "Business Information"
                ) {
                    FormField(
                        label = "Business Name",
                        value = uiState.storeProfile?.businessName ?: "",
                        onValueChange = { /* Update business name */ },
                        isEnabled = false
                    )
                    
                    FormField(
                        label = "Business Type",
                        value = uiState.storeProfile?.partnerType?.name ?: "",
                        onValueChange = { /* Update business type */ },
                        isEnabled = false
                    )
                    
                    FormField(
                        label = "Business Address",
                        value = uiState.storeProfile?.businessAddress?.address ?: "",
                        onValueChange = { /* Update address */ },
                        isEnabled = false
                    )
                    
                    FormField(
                        label = "Phone Number",
                        value = uiState.storeProfile?.businessAddress?.phone ?: "",
                        onValueChange = { /* Update phone */ },
                        isEnabled = false
                    )
                }
            }
            
            // Working Hours
            item {
                FormSection(
                    title = "Working Hours"
                ) {
                    WorkingHoursDisplay(
                        workingHours = uiState.storeProfile?.workingHours,
                        onEditClick = { showWorkingHoursEditor = true }
                    )
                }
            }
            
            // Business Settings
            item {
                FormSection(
                    title = "Business Settings"
                ) {
                    FormSwitch(
                        label = "Accept Online Orders",
                        checked = uiState.storeProfile?.businessSettings?.acceptOnlineOrders ?: false,
                        onCheckedChange = { /* Update setting */ },
                        supportingText = "Allow customers to place orders online"
                    )
                    
                    FormSwitch(
                        label = "Auto-Confirm Appointments",
                        checked = uiState.storeProfile?.businessSettings?.autoConfirmAppointments ?: false,
                        onCheckedChange = { /* Update setting */ },
                        supportingText = "Automatically confirm new appointments"
                    )
                    
                    FormSwitch(
                        label = "Email Notifications",
                        checked = uiState.storeProfile?.notificationPreferences?.emailNotifications ?: false,
                        onCheckedChange = { /* Update setting */ },
                        supportingText = "Receive email notifications for important updates"
                    )
                }
            }
        }
    }
    
    // Working Hours Editor Dialog
    if (showWorkingHoursEditor) {
        WorkingHoursEditorDialog(
            workingHours = uiState.storeProfile?.workingHours,
            onDismiss = { showWorkingHoursEditor = false },
            onSave = { /* Save working hours */ }
        )
    }
    
    // Business Settings Dialog
    if (showBusinessSettings) {
        BusinessSettingsDialog(
            businessSettings = uiState.storeProfile?.businessSettings,
            onDismiss = { showBusinessSettings = false },
            onSave = { /* Save business settings */ }
        )
    }
}

@Composable
fun StoreOverviewCard(
    storeName: String,
    partnerType: String,
    status: String,
    onEditClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column {
                    Text(
                        text = storeName,
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                    
                    Spacer(modifier = Modifier.height(4.dp))
                    
                    Text(
                        text = partnerType,
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.8f)
                    )
                }
                
                IconButton(onClick = onEditClick) {
                    Icon(
                        imageVector = Icons.Default.Edit,
                        contentDescription = "Edit Store",
                        tint = MaterialTheme.colorScheme.onPrimary
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Circle,
                    contentDescription = null,
                    tint = if (status == "ACTIVE") Color(0xFF4CAF50) else Color(0xFFFF9800),
                    modifier = Modifier.size(12.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = status,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.8f)
                )
            }
        }
    }
}

@Composable
fun WorkingHoursDisplay(
    workingHours: com.clutch.partners.data.model.WorkingHours?,
    onEditClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Working Hours",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            TextButton(onClick = onEditClick) {
                Text("Edit")
            }
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        if (workingHours != null) {
            listOf("Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday").forEach { day ->
                val dayHours = when (day) {
                    "Monday" -> workingHours.monday
                    "Tuesday" -> workingHours.tuesday
                    "Wednesday" -> workingHours.wednesday
                    "Thursday" -> workingHours.thursday
                    "Friday" -> workingHours.friday
                    "Saturday" -> workingHours.saturday
                    "Sunday" -> workingHours.sunday
                    else -> null
                }
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = day,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    
                    Text(
                        text = if (dayHours?.isOpen == true) 
                            "${dayHours.openTime} - ${dayHours.closeTime}"
                        else "Closed",
                        style = MaterialTheme.typography.bodyMedium,
                        color = if (dayHours?.isOpen == true) 
                            MaterialTheme.colorScheme.onSurface 
                        else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                if (day != "Sunday") {
                    Spacer(modifier = Modifier.height(4.dp))
                }
            }
        } else {
            Text(
                text = "Working hours not set",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun WorkingHoursEditorDialog(
    workingHours: com.clutch.partners.data.model.WorkingHours?,
    onDismiss: () -> Unit,
    onSave: (com.clutch.partners.data.model.WorkingHours) -> Unit,
    modifier: Modifier = Modifier
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Edit Working Hours") },
        text = { 
            Text("Working hours editor will be implemented here")
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun BusinessSettingsDialog(
    businessSettings: com.clutch.partners.data.model.BusinessSettings?,
    onDismiss: () -> Unit,
    onSave: (com.clutch.partners.data.model.BusinessSettings) -> Unit,
    modifier: Modifier = Modifier
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Business Settings") },
        text = { 
            Text("Business settings editor will be implemented here")
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
