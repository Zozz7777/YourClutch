package com.clutch.app.ui.screens.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MileageSettingsScreen(
    onNavigateBack: () -> Unit = {}
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(ClutchLayoutSpacing.screenPadding),
        verticalArrangement = Arrangement.spacedBy(ClutchSpacing.md)
    ) {
        item {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onNavigateBack) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back"
                    )
                }
                Text(
                    text = "Mileage Tracking",
                    style = MaterialTheme.typography.headlineMedium
                )
                Spacer(modifier = Modifier.size(48.dp))
            }
        }

        item {
            // Tracking Settings
            SettingsSection(
                title = "Tracking Settings",
                items = listOf(
                    SettingsItem(
                        icon = Icons.Default.Speed,
                        title = "Auto Tracking",
                        subtitle = "Automatically track mileage",
                        onClick = { /* Auto tracking settings */ }
                    ),
                    SettingsItem(
                        icon = Icons.Default.LocationOn,
                        title = "GPS Tracking",
                        subtitle = "Use GPS for accurate mileage tracking",
                        onClick = { /* GPS settings */ }
                    ),
                    SettingsItem(
                        icon = Icons.Default.Schedule,
                        title = "Update Frequency",
                        subtitle = "How often to update mileage",
                        onClick = { /* Update frequency */ }
                    )
                )
            )
        }

        item {
            // Privacy Settings
            SettingsSection(
                title = "Privacy Settings",
                items = listOf(
                    SettingsItem(
                        icon = Icons.Default.PrivacyTip,
                        title = "Location Privacy",
                        subtitle = "Manage location data usage",
                        onClick = { /* Location privacy */ }
                    ),
                    SettingsItem(
                        icon = Icons.Default.Storage,
                        title = "Data Storage",
                        subtitle = "How long to store mileage data",
                        onClick = { /* Data storage */ }
                    ),
                    SettingsItem(
                        icon = Icons.Default.Share,
                        title = "Data Sharing",
                        subtitle = "Share mileage data with service providers",
                        onClick = { /* Data sharing */ }
                    )
                )
            )
        }
    }
}
