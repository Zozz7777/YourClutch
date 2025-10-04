package com.clutch.app.ui.screens.settings

import androidx.compose.foundation.clickable
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
import com.clutch.app.ui.theme.ClutchColors
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * DataScreen.kt - Data management and storage settings
 * 
 * Complete data management screen with storage information,
 * data usage controls, and data export/import options.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DataScreen(
    onNavigateBack: () -> Unit = {}
) {
    var cacheSize by remember { mutableStateOf("245 MB") }
    var dataUsage by remember { mutableStateOf("1.2 GB") }
    var autoSync by remember { mutableStateOf(true) }
    var wifiOnlySync by remember { mutableStateOf(false) }
    var dataCompression by remember { mutableStateOf(true) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Data & Storage") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = ClutchRed,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(ClutchLayoutSpacing.screenPadding),
            verticalArrangement = Arrangement.spacedBy(ClutchSpacing.lg)
        ) {
            item {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Data Management",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                IconButton(onClick = { /* Refresh data */ }) {
                    Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                }
                }
            }

            item {
                // Storage Overview
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Text(
                            text = "Storage Overview",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        StorageItem(
                            icon = Icons.Default.Storage,
                            title = "App Cache",
                            size = cacheSize,
                            color = ClutchColors.primary
                        )
                        
                        StorageItem(
                            icon = Icons.Default.CloudDownload,
                            title = "Downloaded Data",
                            size = "856 MB",
                            color = ClutchColors.success
                        )
                        
                        StorageItem(
                            icon = Icons.Default.Photo,
                            title = "Images & Media",
                            size = "423 MB",
                            color = ClutchColors.warning
                        )
                    }
                }
            }

            item {
                // Data Usage
                DataSection(
                    title = "Data Usage",
                    items = listOf(
                        DataItem(
                            icon = Icons.Default.NetworkCheck,
                            title = "Data Usage This Month",
                            description = "Total data consumed",
                            value = dataUsage,
                            onClick = { /* View detailed usage */ }
                        ),
                        DataItem(
                            icon = Icons.Default.Wifi,
                            title = "Wi-Fi Only Sync",
                            description = "Only sync when connected to Wi-Fi",
                            isToggle = true,
                            isEnabled = wifiOnlySync,
                            onToggle = { wifiOnlySync = !wifiOnlySync }
                        ),
                        DataItem(
                            icon = Icons.Default.Compress,
                            title = "Data Compression",
                            description = "Compress data to save bandwidth",
                            isToggle = true,
                            isEnabled = dataCompression,
                            onToggle = { dataCompression = !dataCompression }
                        )
                    )
                )
            }

            item {
                // Sync Settings
                DataSection(
                    title = "Sync Settings",
                    items = listOf(
                        DataItem(
                            icon = Icons.Default.Sync,
                            title = "Auto Sync",
                            description = "Automatically sync data in background",
                            isToggle = true,
                            isEnabled = autoSync,
                            onToggle = { autoSync = !autoSync }
                        ),
                        DataItem(
                            icon = Icons.Default.Schedule,
                            title = "Sync Frequency",
                            description = "How often to sync data",
                            value = "Every 6 hours",
                            onClick = { /* Change frequency */ }
                        ),
                        DataItem(
                            icon = Icons.Default.CloudSync,
                            title = "Cloud Backup",
                            description = "Backup data to cloud storage",
                            onClick = { /* Manage cloud backup */ }
                        )
                    )
                )
            }

            item {
                // Data Management
                DataSection(
                    title = "Data Management",
                    items = listOf(
                        DataItem(
                            icon = Icons.Default.Download,
                            title = "Export Data",
                            description = "Download your data as a file",
                            onClick = { /* Export data */ }
                        ),
                        DataItem(
                            icon = Icons.Default.Upload,
                            title = "Import Data",
                            description = "Import data from a file",
                            onClick = { /* Import data */ }
                        ),
                        DataItem(
                            icon = Icons.Default.Delete,
                            title = "Clear Cache",
                            description = "Free up storage space",
                            onClick = { /* Clear cache */ }
                        ),
                        DataItem(
                            icon = Icons.Default.DeleteForever,
                            title = "Delete All Data",
                            description = "Permanently delete all app data",
                            onClick = { /* Delete all data */ }
                        )
                    )
                )
            }

            item {
                // Data Types
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Text(
                            text = "Data Types",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        DataTypeItem(
                            icon = Icons.Default.Person,
                            title = "Profile Data",
                            description = "Your personal information and preferences"
                        )
                        
                        DataTypeItem(
                            icon = Icons.Default.DirectionsCar,
                            title = "Vehicle Data",
                            description = "Information about your vehicles"
                        )
                        
                        DataTypeItem(
                            icon = Icons.Default.History,
                            title = "Service History",
                            description = "Records of maintenance and services"
                        )
                        
                        DataTypeItem(
                            icon = Icons.Default.ShoppingCart,
                            title = "Order History",
                            description = "Your parts and service orders"
                        )
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(100.dp))
            }
        }
    }
}

@Composable
private fun DataSection(
    title: String,
    items: List<DataItem>
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(ClutchSpacing.sm)
    ) {
        Text(
            text = title,
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color.Black,
            modifier = Modifier.padding(bottom = ClutchSpacing.sm)
        )
        
        items.forEach { item ->
            DataItemCard(item = item)
        }
    }
}

@Composable
private fun DataItemCard(
    item: DataItem
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { item.onClick() },
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(ClutchSpacing.md),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = null,
                tint = ClutchRed,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.width(ClutchSpacing.md))
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = item.title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.Black
                )
                Text(
                    text = item.description,
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                if (item.value != null) {
                    Text(
                        text = item.value,
                        fontSize = 12.sp,
                        color = ClutchRed
                    )
                }
            }
            
            if (item.isToggle) {
                Switch(
                    checked = item.isEnabled,
                    onCheckedChange = { item.onToggle?.invoke() },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = ClutchRed,
                        uncheckedThumbColor = Color.White,
                        uncheckedTrackColor = Color.Gray
                    )
                )
            } else {
                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = Color.Gray
                )
            }
        }
    }
}

@Composable
private fun StorageItem(
    icon: ImageVector,
    title: String,
    size: String,
    color: Color
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = ClutchSpacing.xs),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = color,
            modifier = Modifier.size(20.dp)
        )
        
        Spacer(modifier = Modifier.width(ClutchSpacing.sm))
        
        Text(
            text = title,
            fontSize = 14.sp,
            color = Color.Black,
            modifier = Modifier.weight(1f)
        )
        
        Text(
            text = size,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = color
        )
    }
}

@Composable
private fun DataTypeItem(
    icon: ImageVector,
    title: String,
    description: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = ClutchSpacing.xs),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = ClutchRed,
            modifier = Modifier.size(20.dp)
        )
        
        Spacer(modifier = Modifier.width(ClutchSpacing.sm))
        
        Column {
            Text(
                text = title,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            Text(
                text = description,
                fontSize = 12.sp,
                color = Color.Gray
            )
        }
    }
}

data class DataItem(
    val icon: ImageVector,
    val title: String,
    val description: String,
    val value: String? = null,
    val isToggle: Boolean = false,
    val isEnabled: Boolean = false,
    val onToggle: (() -> Unit)? = null,
    val onClick: () -> Unit = {}
)
