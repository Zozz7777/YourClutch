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
fun SyncScreen(
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
                    text = "Sync Settings",
                    style = MaterialTheme.typography.headlineMedium
                )
                Spacer(modifier = Modifier.size(48.dp))
            }
        }

        item {
            // Sync Status
            ClutchCardBasic {
                Column(
                    modifier = Modifier.padding(ClutchSpacing.md)
                ) {
                    Text(
                        text = "Sync Status",
                        style = MaterialTheme.typography.titleMedium,
                        color = ClutchColors.primary
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Last sync: 2 minutes ago",
                            style = MaterialTheme.typography.bodyLarge
                        )
                        Switch(
                            checked = true,
                            onCheckedChange = { /* Toggle sync */ }
                        )
                    }
                }
            }
        }

        item {
            // Sync Options
            SettingsSection(
                title = "Sync Options",
                items = listOf(
                    SettingsItem(
                        icon = Icons.Default.CloudSync,
                        title = "Auto Sync",
                        subtitle = "Automatically sync data when connected",
                        onClick = { /* Auto sync settings */ }
                    ),
                    SettingsItem(
                        icon = Icons.Default.Wifi,
                        title = "WiFi Only",
                        subtitle = "Sync only when connected to WiFi",
                        onClick = { /* WiFi only settings */ }
                    ),
                    SettingsItem(
                        icon = Icons.Default.Schedule,
                        title = "Sync Frequency",
                        subtitle = "How often to sync data",
                        onClick = { /* Sync frequency settings */ }
                    )
                )
            )
        }
    }
}
