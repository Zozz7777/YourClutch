package com.clutch.partners.ui.screens.advanced

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.clutch.partners.ClutchPartnersTheme
import com.clutch.partners.ui.components.StatCard
import com.clutch.partners.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DevicesScreen(
    navController: NavController,
    viewModel: MainViewModel = hiltViewModel()
) {
    ClutchPartnersTheme {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Devices") },
                    navigationIcon = {
                        IconButton(onClick = { navController.popBackStack() }) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                        }
                    },
                    actions = {
                        IconButton(onClick = { /* Add device */ }) {
                            Icon(Icons.Default.Add, contentDescription = "Add Device")
                        }
                    }
                )
            }
        ) { paddingValues ->
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxWidth()
                        ) {
                            StatCard(
                                title = "Active Devices",
                                value = "8",
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxWidth()
                        ) {
                            StatCard(
                                title = "Offline",
                                value = "2",
                                color = MaterialTheme.colorScheme.error
                            )
                        }
                    }
                }
                
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxWidth()
                        ) {
                            StatCard(
                                title = "Total Devices",
                                value = "10",
                                color = MaterialTheme.colorScheme.secondary
                            )
                        }
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxWidth()
                        ) {
                            StatCard(
                                title = "Maintenance",
                                value = "1",
                                color = MaterialTheme.colorScheme.tertiary
                            )
                        }
                    }
                }
                
                items(sampleDevices) { device ->
                    DeviceCard(device = device)
                }
            }
        }
    }
}

@Composable
fun DeviceCard(device: Device) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = device.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                DeviceStatusChip(status = device.status)
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = device.type,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Text(
                text = "Last seen: ${device.lastSeen}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun DeviceStatusChip(status: String) {
    val (backgroundColor, textColor) = when (status) {
        "Online" -> MaterialTheme.colorScheme.primary to MaterialTheme.colorScheme.onPrimary
        "Offline" -> MaterialTheme.colorScheme.error to MaterialTheme.colorScheme.onError
        "Maintenance" -> MaterialTheme.colorScheme.tertiary to MaterialTheme.colorScheme.onTertiary
        else -> MaterialTheme.colorScheme.surfaceVariant to MaterialTheme.colorScheme.onSurfaceVariant
    }
    
    Surface(
        modifier = Modifier,
        color = backgroundColor,
        shape = MaterialTheme.shapes.small
    ) {
        Text(
            text = status,
            style = MaterialTheme.typography.bodySmall,
            color = textColor,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}

data class Device(
    val id: String,
    val name: String,
    val type: String,
    val status: String,
    val lastSeen: String
)

val sampleDevices = listOf(
    Device("1", "POS Terminal 1", "POS", "Online", "2 minutes ago"),
    Device("2", "Barcode Scanner", "Scanner", "Online", "5 minutes ago"),
    Device("3", "Receipt Printer", "Printer", "Offline", "1 hour ago"),
    Device("4", "Cash Drawer", "Hardware", "Online", "1 minute ago"),
    Device("5", "Card Reader", "Payment", "Maintenance", "30 minutes ago")
)