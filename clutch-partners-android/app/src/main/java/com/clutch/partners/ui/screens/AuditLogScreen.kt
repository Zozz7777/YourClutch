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
fun AuditLogScreen() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    var selectedFilter by remember { mutableStateOf(0) }
    val filters = listOf("All", "Orders", "Payments", "Inventory", "Settings", "Security")
    
    var selectedDateRange by remember { mutableStateOf(0) }
    val dateRanges = listOf("Today", "Week", "Month", "All")
    
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
                    text = if (isRTL) "سجل التدقيق" else "Audit Log",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isRTL) DarkForeground else LightForeground
                )
                
                Row {
                    IconButton(onClick = { /* TODO: Export logs */ }) {
                        Icon(
                            Icons.Filled.Download,
                            contentDescription = if (isRTL) "تصدير السجلات" else "Export Logs",
                            tint = PartnersBlue
                        )
                    }
                    IconButton(onClick = { /* TODO: Refresh logs */ }) {
                        Icon(
                            Icons.Filled.Refresh,
                            contentDescription = if (isRTL) "تحديث" else "Refresh",
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
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Date Range Filter
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                dateRanges.forEachIndexed { index, range ->
                    FilterChip(
                        onClick = { selectedDateRange = index },
                        label = { Text(range) },
                        selected = selectedDateRange == index,
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = LightSecondary,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Audit Logs List
            AuditLogsList(
                isRTL = isRTL,
                filter = filters[selectedFilter],
                dateRange = dateRanges[selectedDateRange]
            )
        }
    }
}

@Composable
fun AuditLogsList(
    isRTL: Boolean,
    filter: String,
    dateRange: String
) {
    val auditLogs = listOf(
        AuditLogEntry(
            id = "AUD-001",
            action = if (isRTL) "إنشاء طلب جديد" else "Created New Order",
            description = if (isRTL) "تم إنشاء طلب #ORD-001 بقيمة ₪250" else "Created order #ORD-001 for ₪250",
            user = if (isRTL) "أحمد محمد" else "Ahmed Mohamed",
            category = AuditCategory.ORDERS,
            timestamp = Date(),
            severity = AuditSeverity.INFO,
            ipAddress = "192.168.1.100",
            userAgent = "Clutch Partners App 1.0.0"
        ),
        AuditLogEntry(
            id = "AUD-002",
            action = if (isRTL) "تحديث المخزون" else "Updated Inventory",
            description = if (isRTL) "تم تحديث كمية المنتج ABC-123 من 50 إلى 45" else "Updated quantity for product ABC-123 from 50 to 45",
            user = if (isRTL) "فاطمة علي" else "Fatima Ali",
            category = AuditCategory.INVENTORY,
            timestamp = Date(),
            severity = AuditSeverity.INFO,
            ipAddress = "192.168.1.101",
            userAgent = "Clutch Partners App 1.0.0"
        ),
        AuditLogEntry(
            id = "AUD-003",
            action = if (isRTL) "تسجيل دخول" else "User Login",
            description = if (isRTL) "تم تسجيل الدخول بنجاح" else "Successful login",
            user = if (isRTL) "محمد أحمد" else "Mohamed Ahmed",
            category = AuditCategory.SECURITY,
            timestamp = Date(),
            severity = AuditSeverity.INFO,
            ipAddress = "192.168.1.102",
            userAgent = "Clutch Partners App 1.0.0"
        ),
        AuditLogEntry(
            id = "AUD-004",
            action = if (isRTL) "دفعة مستلمة" else "Payment Received",
            description = if (isRTL) "تم استلام دفعة بقيمة ₪1,250" else "Received payment of ₪1,250",
            user = if (isRTL) "نظام الدفع" else "Payment System",
            category = AuditCategory.PAYMENTS,
            timestamp = Date(),
            severity = AuditSeverity.SUCCESS,
            ipAddress = "192.168.1.103",
            userAgent = "Payment Gateway"
        ),
        AuditLogEntry(
            id = "AUD-005",
            action = if (isRTL) "محاولة دخول فاشلة" else "Failed Login Attempt",
            description = if (isRTL) "محاولة دخول ببيانات خاطئة" else "Login attempt with incorrect credentials",
            user = if (isRTL) "مجهول" else "Unknown",
            category = AuditCategory.SECURITY,
            timestamp = Date(),
            severity = AuditSeverity.WARNING,
            ipAddress = "192.168.1.104",
            userAgent = "Clutch Partners App 1.0.0"
        ),
        AuditLogEntry(
            id = "AUD-006",
            action = if (isRTL) "تحديث إعدادات المتجر" else "Updated Store Settings",
            description = if (isRTL) "تم تحديث ساعات العمل" else "Updated working hours",
            user = if (isRTL) "أحمد محمد" else "Ahmed Mohamed",
            category = AuditCategory.SETTINGS,
            timestamp = Date(),
            severity = AuditSeverity.INFO,
            ipAddress = "192.168.1.105",
            userAgent = "Clutch Partners App 1.0.0"
        )
    )
    
    val filteredLogs = if (filter == "All") {
        auditLogs
    } else {
        auditLogs.filter { it.category.name.equals(filter, ignoreCase = true) }
    }
    
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(filteredLogs) { log ->
            AuditLogCard(
                log = log,
                isRTL = isRTL,
                onClick = { /* TODO: Show log details */ }
            )
        }
    }
}

@Composable
fun AuditLogCard(
    log: AuditLogEntry,
    isRTL: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        colors = CardDefaults.cardColors(
            containerColor = if (isRTL) DarkCard else LightCard
        ),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
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
                    text = log.id,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isRTL) DarkMutedForeground else LightMutedForeground
                )
                
                AuditSeverityChip(
                    severity = log.severity,
                    isRTL = isRTL
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = log.action,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = log.description,
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
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Filled.Person,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = if (isRTL) DarkMutedForeground else LightMutedForeground
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = log.user,
                        fontSize = 12.sp,
                        color = if (isRTL) DarkMutedForeground else LightMutedForeground
                    )
                }
                
                Text(
                    text = formatAuditTimestamp(log.timestamp, isRTL),
                    fontSize = 12.sp,
                    color = if (isRTL) DarkMutedForeground else LightMutedForeground
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                AuditCategoryChip(
                    category = log.category,
                    isRTL = isRTL
                )
                
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Filled.Computer,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = if (isRTL) DarkMutedForeground else LightMutedForeground
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = log.ipAddress,
                        fontSize = 10.sp,
                        color = if (isRTL) DarkMutedForeground else LightMutedForeground
                    )
                }
            }
        }
    }
}

@Composable
fun AuditSeverityChip(
    severity: AuditSeverity,
    isRTL: Boolean
) {
    val (text, color) = when (severity) {
        AuditSeverity.INFO -> Pair(if (isRTL) "معلومات" else "Info", LightInfo)
        AuditSeverity.SUCCESS -> Pair(if (isRTL) "نجح" else "Success", LightSuccess)
        AuditSeverity.WARNING -> Pair(if (isRTL) "تحذير" else "Warning", LightWarning)
        AuditSeverity.ERROR -> Pair(if (isRTL) "خطأ" else "Error", LightDestructive)
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

@Composable
fun AuditCategoryChip(
    category: AuditCategory,
    isRTL: Boolean
) {
    val (text, color) = when (category) {
        AuditCategory.ORDERS -> Pair(if (isRTL) "طلبات" else "Orders", PartnersBlue)
        AuditCategory.PAYMENTS -> Pair(if (isRTL) "مدفوعات" else "Payments", LightSuccess)
        AuditCategory.INVENTORY -> Pair(if (isRTL) "مخزون" else "Inventory", LightWarning)
        AuditCategory.SETTINGS -> Pair(if (isRTL) "إعدادات" else "Settings", LightInfo)
        AuditCategory.SECURITY -> Pair(if (isRTL) "أمان" else "Security", LightDestructive)
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

fun formatAuditTimestamp(date: Date, isRTL: Boolean): String {
    // Simple time formatting - in real app would use proper date formatting
    return if (isRTL) "منذ 5 دقائق" else "5 minutes ago"
}

data class AuditLogEntry(
    val id: String,
    val action: String,
    val description: String,
    val user: String,
    val category: AuditCategory,
    val timestamp: Date,
    val severity: AuditSeverity,
    val ipAddress: String,
    val userAgent: String
)

enum class AuditCategory {
    ORDERS, PAYMENTS, INVENTORY, SETTINGS, SECURITY
}

enum class AuditSeverity {
    INFO, SUCCESS, WARNING, ERROR
}
