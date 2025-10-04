package com.clutch.partners.ui.screens

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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.runtime.CompositionLocalProvider
import com.clutch.partners.ui.theme.*
import com.clutch.partners.utils.LanguageManager
import java.util.Date

@Composable
fun NotificationsScreen() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    var selectedFilter by remember { mutableStateOf(0) }
    val filters = listOf("All", "Orders", "Payments", "System")
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(16.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = if (isRTL) "الإشعارات" else "Notifications",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isRTL) DarkForeground else LightForeground
                )
                
                Row {
                    IconButton(onClick = { /* TODO: Mark all as read */ }) {
                        Icon(
                            Icons.Filled.DoneAll,
                            contentDescription = if (isRTL) "تحديد الكل كمقروء" else "Mark all as read",
                            tint = PartnersBlue
                        )
                    }
                    IconButton(onClick = { /* TODO: Settings */ }) {
                        Icon(
                            Icons.Filled.Settings,
                            contentDescription = if (isRTL) "الإعدادات" else "Settings",
                            tint = if (isRTL) DarkMutedForeground else LightMutedForeground
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Filter Chips
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                filters.forEachIndexed { index, filter ->
                    FilterChip(
                        onClick = { selectedFilter = index },
                        label = { Text(filter) },
                        selected = selectedFilter == index,
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PartnersBlue,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Notifications List
            NotificationsList(isRTL = isRTL, filter = filters[selectedFilter])
        }
    }
}

@Composable
fun NotificationsList(isRTL: Boolean, filter: String) {
    val notifications = listOf(
        Notification(
            id = "NOT-001",
            title = if (isRTL) "طلب جديد" else "New Order",
            message = if (isRTL) "تم استلام طلب جديد من محمد أحمد" else "New order received from Mohamed Ahmed",
            type = NotificationType.ORDER,
            isRead = false,
            timestamp = Date(),
            icon = Icons.Filled.ShoppingCart,
            color = PartnersBlue
        ),
        Notification(
            id = "NOT-002",
            title = if (isRTL) "دفعة مستلمة" else "Payment Received",
            message = if (isRTL) "تم استلام دفعة بقيمة ₪1,250" else "Payment of ₪1,250 received",
            type = NotificationType.PAYMENT,
            isRead = false,
            timestamp = Date(),
            icon = Icons.Filled.Payment,
            color = LightSuccess
        ),
        Notification(
            id = "NOT-003",
            title = if (isRTL) "تحديث النظام" else "System Update",
            message = if (isRTL) "تحديث جديد متاح للتطبيق" else "New app update available",
            type = NotificationType.SYSTEM,
            isRead = true,
            timestamp = Date(),
            icon = Icons.Filled.SystemUpdate,
            color = LightInfo
        ),
        Notification(
            id = "NOT-004",
            title = if (isRTL) "موعد جديد" else "New Appointment",
            message = if (isRTL) "تم حجز موعد جديد مع فاطمة علي" else "New appointment booked with Fatima Ali",
            type = NotificationType.ORDER,
            isRead = true,
            timestamp = Date(),
            icon = Icons.Filled.Schedule,
            color = Orange
        ),
        Notification(
            id = "NOT-005",
            title = if (isRTL) "تنبيه مخزون" else "Inventory Alert",
            message = if (isRTL) "مخزون منخفض لـ 5 منتجات" else "Low stock for 5 products",
            type = NotificationType.SYSTEM,
            isRead = false,
            timestamp = Date(),
            icon = Icons.Filled.Warning,
            color = LightWarning
        )
    )
    
    val filteredNotifications = if (filter == "All") {
        notifications
    } else {
        notifications.filter { it.type.name.equals(filter, ignoreCase = true) }
    }
    
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(filteredNotifications) { notification ->
            NotificationCard(
                notification = notification,
                isRTL = isRTL,
                onClick = { /* TODO: Handle notification click */ }
            )
        }
    }
}

@Composable
fun NotificationCard(
    notification: Notification,
    isRTL: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        colors = CardDefaults.cardColors(
            containerColor = if (notification.isRead) {
                if (isRTL) DarkMuted else LightMuted
            } else {
                if (isRTL) DarkCard else LightCard
            }
        ),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(
            defaultElevation = if (notification.isRead) 1.dp else 4.dp
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.Top
        ) {
            // Icon
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(
                        notification.color.copy(alpha = 0.1f),
                        RoundedCornerShape(8.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = notification.icon,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp),
                    tint = notification.color
                )
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            // Content
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
                        fontSize = 16.sp,
                        fontWeight = if (notification.isRead) FontWeight.Normal else FontWeight.Bold,
                        color = if (isRTL) DarkForeground else LightForeground
                    )
                    
                    if (!notification.isRead) {
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .background(
                                    PartnersBlue,
                                    RoundedCornerShape(4.dp)
                                )
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = notification.message,
                    fontSize = 14.sp,
                    color = if (isRTL) DarkMutedForeground else LightMutedForeground,
                    lineHeight = 20.sp
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = formatTimestamp(notification.timestamp, isRTL),
                        fontSize = 12.sp,
                        color = if (isRTL) DarkMutedForeground else LightMutedForeground
                    )
                    
                    NotificationTypeChip(
                        type = notification.type,
                        isRTL = isRTL
                    )
                }
            }
        }
    }
}

@Composable
fun NotificationTypeChip(
    type: NotificationType,
    isRTL: Boolean
) {
    val (text, color) = when (type) {
        NotificationType.ORDER -> Pair(if (isRTL) "طلب" else "Order", PartnersBlue)
        NotificationType.PAYMENT -> Pair(if (isRTL) "دفعة" else "Payment", LightSuccess)
        NotificationType.SYSTEM -> Pair(if (isRTL) "نظام" else "System", LightInfo)
    }
    
    Surface(
        color = color.copy(alpha = 0.1f),
        shape = RoundedCornerShape(8.dp)
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
            fontSize = 10.sp,
            fontWeight = FontWeight.Medium,
            color = color
        )
    }
}

fun formatTimestamp(date: Date, isRTL: Boolean): String {
    // Simple time formatting - in real app would use proper date formatting
    return if (isRTL) "منذ ساعتين" else "2 hours ago"
}

data class Notification(
    val id: String,
    val title: String,
    val message: String,
    val type: NotificationType,
    val isRead: Boolean,
    val timestamp: Date,
    val icon: ImageVector,
    val color: Color
)

enum class NotificationType {
    ORDER, PAYMENT, SYSTEM
}
