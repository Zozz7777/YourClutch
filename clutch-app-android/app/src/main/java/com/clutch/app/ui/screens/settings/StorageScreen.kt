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
fun StorageScreen(
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
                    text = "Storage Settings",
                    style = MaterialTheme.typography.headlineMedium
                )
                Spacer(modifier = Modifier.size(48.dp))
            }
        }

        item {
            // Storage Overview
            ClutchCardBasic {
                Column(
                    modifier = Modifier.padding(ClutchSpacing.md)
                ) {
                    Text(
                        text = "Storage Overview",
                        style = MaterialTheme.typography.titleMedium,
                        color = ClutchColors.primary
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Used: 2.1 GB",
                            style = MaterialTheme.typography.bodyLarge
                        )
                        Text(
                            text = "Available: 5.9 GB",
                            style = MaterialTheme.typography.bodyLarge,
                            color = ClutchColors.mutedForeground
                        )
                    }
                }
            }
        }

        item {
            // Storage Options
            SettingsSection(
                title = "Storage Management",
                items = listOf(
                    SettingsItem(
                        icon = Icons.Default.Delete,
                        title = "Clear Cache",
                        subtitle = "Clear app cache and temporary files",
                        onClick = { /* Clear cache */ }
                    ),
                    SettingsItem(
                        icon = Icons.Default.Download,
                        title = "Download Settings",
                        subtitle = "Manage download preferences",
                        onClick = { /* Download settings */ }
                    ),
                    SettingsItem(
                        icon = Icons.Default.Storage,
                        title = "Media Storage",
                        subtitle = "Manage photos and videos storage",
                        onClick = { /* Media storage */ }
                    )
                )
            )
        }
    }
}
