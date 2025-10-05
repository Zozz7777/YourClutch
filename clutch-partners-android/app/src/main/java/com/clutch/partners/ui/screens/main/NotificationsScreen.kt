package com.clutch.partners.ui.screens.main

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.clutch.partners.ClutchPartnersTheme
import com.clutch.partners.viewmodel.MainViewModel
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(
    navController: NavController,
    viewModel: MainViewModel = hiltViewModel()
) {
    var selectedFilter by remember { mutableStateOf("all") }
    var showFilterMenu by remember { mutableStateOf(false) }
    
    ClutchPartnersTheme {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { 
                        Text(
                            "Notifications",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold
                        )
                    },
                    actions = {
                        IconButton(onClick = { showFilterMenu = true }) {
                            Icon(Icons.Default.FilterList, contentDescription = "Filter")
                        }
                        IconButton(onClick = { /* Mark all as read */ }) {
                            Icon(Icons.Default.DoneAll, contentDescription = "Mark all as read")
                        }
                    }
                )
            }
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .background(MaterialTheme.colorScheme.background)
            ) {
                // Filter chips
                LazyRow(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(listOf("all", "orders", "payments", "system", "promotions", "training")) { filter ->
                        FilterChip(
                            onClick = { selectedFilter = filter },
                            label = { 
                                Text(
                                    filter.replaceFirstChar { it.uppercase() },
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            },
                            selected = selectedFilter == filter,
                            modifier = Modifier.clip(RoundedCornerShape(20.dp))
                        )
                    }
                }
                
                // Notifications list
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(sampleNotifications.filter { 
                        selectedFilter == "all" || it.type == selectedFilter 
                    }) { notification ->
                        NotificationCard(
                            notification = notification,
                            onNotificationClick = { /* Handle notification click */ }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun NotificationCard(
    notification: NotificationItem,
    onNotificationClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onNotificationClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (notification.isRead) 
                MaterialTheme.colorScheme.surface 
            else 
                MaterialTheme.colorScheme.primaryContainer.copy(alpha = 0.1f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.Top
        ) {
            // Notification icon
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(
                        when (notification.type) {
                            "orders" -> Color(0xFF4CAF50)
                            "payments" -> Color(0xFF2196F3)
                            "system" -> Color(0xFFFF9800)
                            "promotions" -> Color(0xFFE91E63)
                            "training" -> Color(0xFF9C27B0)
                            else -> MaterialTheme.colorScheme.primary
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = when (notification.type) {
                        "orders" -> Icons.Default.ShoppingCart
                        "payments" -> Icons.Default.Payment
                        "system" -> Icons.Default.Settings
                        "promotions" -> Icons.Default.LocalOffer
                        "training" -> Icons.Default.School
                        else -> Icons.Default.Notifications
                    },
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            // Notification content
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Text(
                        text = notification.title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = if (notification.isRead) FontWeight.Normal else FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                    
                    if (!notification.isRead) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .background(MaterialTheme.colorScheme.primary)
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = notification.message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Center
                ) {
                    Text(
                        text = formatNotificationTime(notification.createdAt),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    if (notification.hasAction) {
                        TextButton(
                            onClick = { /* Handle action */ },
                            contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = notification.actionText ?: "View",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            }
        }
    }
}

data class NotificationItem(
    val id: String,
    val type: String,
    val title: String,
    val message: String,
    val isRead: Boolean,
    val createdAt: Date,
    val hasAction: Boolean = false,
    val actionText: String? = null,
    val data: Map<String, Any>? = null
)

val sampleNotifications = listOf(
    NotificationItem(
        id = "1",
        type = "orders",
        title = "New Order Received",
        message = "You have received a new order for brake pad replacement from Ahmed Ali. Order value: 450 EGP",
        isRead = false,
        createdAt = Date(System.currentTimeMillis() - 5 * 60 * 1000), // 5 minutes ago
        hasAction = true,
        actionText = "View Order"
    ),
    NotificationItem(
        id = "2",
        type = "payments",
        title = "Payment Received",
        message = "Weekly payment of 2,500 EGP has been processed and will be available in your account within 2 business days.",
        isRead = false,
        createdAt = Date(System.currentTimeMillis() - 2 * 60 * 60 * 1000), // 2 hours ago
        hasAction = true,
        actionText = "View Details"
    ),
    NotificationItem(
        id = "3",
        type = "system",
        title = "System Maintenance",
        message = "Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM. Some features may be temporarily unavailable.",
        isRead = true,
        createdAt = Date(System.currentTimeMillis() - 6 * 60 * 60 * 1000), // 6 hours ago
        hasAction = false
    ),
    NotificationItem(
        id = "4",
        type = "promotions",
        title = "Special Promotion Available",
        message = "Get 15% commission bonus on all orders completed this week. Limited time offer!",
        isRead = true,
        createdAt = Date(System.currentTimeMillis() - 24 * 60 * 60 * 1000), // 1 day ago
        hasAction = true,
        actionText = "Learn More"
    ),
    NotificationItem(
        id = "5",
        type = "training",
        title = "New Training Course Available",
        message = "Complete the 'Advanced Brake Systems' course to earn your certification and unlock premium features.",
        isRead = true,
        createdAt = Date(System.currentTimeMillis() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        hasAction = true,
        actionText = "Start Course"
    ),
    NotificationItem(
        id = "6",
        type = "orders",
        title = "Order Completed",
        message = "Order #ORD-2024-001 has been successfully completed. Customer rating: 5 stars",
        isRead = true,
        createdAt = Date(System.currentTimeMillis() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        hasAction = true,
        actionText = "View Rating"
    )
)

fun formatNotificationTime(date: Date): String {
    val now = Date()
    val diff = now.time - date.time
    
    return when {
        diff < 60 * 1000 -> "Just now"
        diff < 60 * 60 * 1000 -> "${diff / (60 * 1000)}m ago"
        diff < 24 * 60 * 60 * 1000 -> "${diff / (60 * 60 * 1000)}h ago"
        diff < 7 * 24 * 60 * 60 * 1000 -> "${diff / (24 * 60 * 60 * 1000)}d ago"
        else -> SimpleDateFormat("MMM dd, yyyy", Locale.getDefault()).format(date)
    }
}
