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
fun MaintenanceSettingsScreen(
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
                    text = "Maintenance Reminders",
                    style = MaterialTheme.typography.headlineMedium
                )
                Spacer(modifier = Modifier.size(48.dp))
            }
        }

        item {
            // Reminder Settings
            SettingsSection(
                title = "Reminder Settings",
                items = listOf(
                    SettingsItem(
                        icon = Icons.Default.Notifications,
                        title = "Oil Change Reminders",
                        subtitle = "Get notified when oil change is due",
                        onClick = { /* Oil change settings */ }
                    ),
                    SettingsItem(
                        icon = Icons.Default.Schedule,
                        title = "Service Intervals",
                        subtitle = "Configure service reminder intervals",
                        onClick = { /* Service intervals */ }
                    ),
                    SettingsItem(
                        icon = Icons.Default.Warning,
                        title = "Urgent Alerts",
                        subtitle = "Get alerts for urgent maintenance",
                        onClick = { /* Urgent alerts */ }
                    )
                )
            )
        }

        item {
            // Notification Preferences
            SettingsSection(
                title = "Notification Preferences",
                items = listOf(
                    SettingsItem(
                        icon = Icons.Default.Email,
                        title = "Email Notifications",
                        subtitle = "Receive maintenance reminders via email",
                        onClick = { /* Email settings */ }
                    ),
                    SettingsItem(
                        icon = Icons.Default.Phone,
                        title = "SMS Notifications",
                        subtitle = "Receive maintenance reminders via SMS",
                        onClick = { /* SMS settings */ }
                    ),
                    SettingsItem(
                        icon = Icons.Default.Schedule,
                        title = "Reminder Timing",
                        subtitle = "When to send maintenance reminders",
                        onClick = { /* Timing settings */ }
                    )
                )
            )
        }
    }
}
