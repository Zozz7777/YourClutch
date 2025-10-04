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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.hilt.navigation.compose.hiltViewModel
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*
import com.clutch.app.features.notifications.NotificationManager
import com.clutch.app.data.model.NotificationSettings

/**
 * NotificationsScreen.kt - Notification settings and preferences
 * 
 * Complete notification settings screen with all notification preferences,
 * push notification controls, and notification categories.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(
    onNavigateBack: () -> Unit = {},
    viewModel: NotificationManager = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    // Load notification settings on first composition
    LaunchedEffect(Unit) {
        viewModel.loadNotificationSettings()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Notifications") },
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
                        text = "Notification Settings",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                }
            }

            item {
                // General Notifications
                NotificationSection(
                    title = "General Notifications",
                    items = listOf(
                        NotificationItem(
                            icon = Icons.Default.Notifications,
                            title = "Push Notifications",
                            description = "Receive push notifications on your device",
                            isEnabled = uiState.settings.pushNotifications,
                            onToggle = { 
                                val newSettings = uiState.settings.copy(pushNotifications = !uiState.settings.pushNotifications)
                                viewModel.updateNotificationSettings(newSettings)
                            }
                        ),
                        NotificationItem(
                            icon = Icons.Default.Email,
                            title = "Email Notifications",
                            description = "Receive notifications via email",
                            isEnabled = uiState.settings.emailNotifications,
                            onToggle = { 
                                val newSettings = uiState.settings.copy(emailNotifications = !uiState.settings.emailNotifications)
                                viewModel.updateNotificationSettings(newSettings)
                            }
                        ),
                        NotificationItem(
                            icon = Icons.Default.Sms,
                            title = "SMS Notifications",
                            description = "Receive notifications via SMS",
                            isEnabled = uiState.settings.smsNotifications,
                            onToggle = { 
                                val newSettings = uiState.settings.copy(smsNotifications = !uiState.settings.smsNotifications)
                                viewModel.updateNotificationSettings(newSettings)
                            }
                        )
                    )
                )
            }

            item {
                // Service Notifications
                NotificationSection(
                    title = "Service Notifications",
                    items = listOf(
                        NotificationItem(
                            icon = Icons.Default.Schedule,
                            title = "Service Reminders",
                            description = "Reminders for upcoming service appointments",
                            isEnabled = uiState.settings.serviceNotifications,
                            onToggle = { 
                                val newSettings = uiState.settings.copy(serviceNotifications = !uiState.settings.serviceNotifications)
                                viewModel.updateNotificationSettings(newSettings)
                            }
                        ),
                        NotificationItem(
                            icon = Icons.Default.Build,
                            title = "Maintenance Alerts",
                            description = "Alerts for maintenance due",
                            isEnabled = uiState.settings.maintenanceNotifications,
                            onToggle = { 
                                val newSettings = uiState.settings.copy(maintenanceNotifications = !uiState.settings.maintenanceNotifications)
                                viewModel.updateNotificationSettings(newSettings)
                            }
                        ),
                        NotificationItem(
                            icon = Icons.Default.Warning,
                            title = "Parts Expiry Alerts",
                            description = "Alerts when parts are about to expire",
                            isEnabled = uiState.settings.maintenanceNotifications,
                            onToggle = { 
                                val newSettings = uiState.settings.copy(maintenanceNotifications = !uiState.settings.maintenanceNotifications)
                                viewModel.updateNotificationSettings(newSettings)
                            }
                        )
                    )
                )
            }

            item {
                // Marketing Notifications
                NotificationSection(
                    title = "Marketing & Updates",
                    items = listOf(
                        NotificationItem(
                            icon = Icons.Default.LocalOffer,
                            title = "Promotional Offers",
                            description = "Special offers and discounts",
                            isEnabled = uiState.settings.promotionNotifications,
                            onToggle = { 
                                val newSettings = uiState.settings.copy(promotionNotifications = !uiState.settings.promotionNotifications)
                                viewModel.updateNotificationSettings(newSettings)
                            }
                        ),
                        NotificationItem(
                            icon = Icons.Default.Group,
                            title = "Community Updates",
                            description = "Updates from the community",
                            isEnabled = uiState.settings.loyaltyNotifications,
                            onToggle = { 
                                val newSettings = uiState.settings.copy(loyaltyNotifications = !uiState.settings.loyaltyNotifications)
                                viewModel.updateNotificationSettings(newSettings)
                            }
                        ),
                        NotificationItem(
                            icon = Icons.Default.CardGiftcard,
                            title = "Loyalty Rewards",
                            description = "Loyalty points and rewards updates",
                            isEnabled = uiState.settings.loyaltyNotifications,
                            onToggle = { 
                                val newSettings = uiState.settings.copy(loyaltyNotifications = !uiState.settings.loyaltyNotifications)
                                viewModel.updateNotificationSettings(newSettings)
                            }
                        )
                    )
                )
            }

            item {
                // Emergency Notifications
                NotificationSection(
                    title = "Emergency & Safety",
                    items = listOf(
                        NotificationItem(
                            icon = Icons.Default.Emergency,
                            title = "Emergency Alerts",
                            description = "Critical safety and emergency notifications",
                            isEnabled = uiState.settings.serviceNotifications,
                            onToggle = { 
                                val newSettings = uiState.settings.copy(serviceNotifications = !uiState.settings.serviceNotifications)
                                viewModel.updateNotificationSettings(newSettings)
                            }
                        )
                    )
                )
            }

            item {
                Spacer(modifier = Modifier.height(100.dp))
            }
        }
    }
}

@Composable
private fun NotificationSection(
    title: String,
    items: List<NotificationItem>
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
            NotificationItemCard(item = item)
        }
    }
}

@Composable
private fun NotificationItemCard(
    item: NotificationItem
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
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
            }
            
            Switch(
                checked = item.isEnabled,
                onCheckedChange = { item.onToggle() },
                colors = SwitchDefaults.colors(
                    checkedThumbColor = Color.White,
                    checkedTrackColor = ClutchRed,
                    uncheckedThumbColor = Color.White,
                    uncheckedTrackColor = Color.Gray
                )
            )
        }
    }
}

data class NotificationItem(
    val icon: ImageVector,
    val title: String,
    val description: String,
    val isEnabled: Boolean,
    val onToggle: () -> Unit
)
