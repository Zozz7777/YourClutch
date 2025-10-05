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
fun AuditScreen(
    navController: NavController,
    viewModel: MainViewModel = hiltViewModel()
) {
    var selectedFilter by remember { mutableStateOf("all") }
    var selectedSeverity by remember { mutableStateOf("all") }
    var showFilterDialog by remember { mutableStateOf(false) }
    var showExportDialog by remember { mutableStateOf(false) }
    
    ClutchPartnersTheme {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { 
                        Text(
                            "Audit Log",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold
                        )
                    },
                    actions = {
                        IconButton(onClick = { showFilterDialog = true }) {
                            Icon(Icons.Default.FilterList, contentDescription = "Filter")
                        }
                        IconButton(onClick = { showExportDialog = true }) {
                            Icon(Icons.Default.Download, contentDescription = "Export")
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
                    items(listOf("all", "authentication", "orders", "payments", "inventory", "settings")) { filter ->
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
                
                // Severity filter
                LazyRow(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(listOf("all", "low", "medium", "high", "critical")) { severity ->
                        FilterChip(
                            onClick = { selectedSeverity = severity },
                            label = { 
                                Text(
                                    severity.replaceFirstChar { it.uppercase() },
                                    style = MaterialTheme.typography.bodyMedium
                                )
                            },
                            selected = selectedSeverity == severity,
                            modifier = Modifier.clip(RoundedCornerShape(20.dp))
                        )
                    }
                }
                
                // Audit logs list
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(sampleAuditLogs.filter { 
                        (selectedFilter == "all" || it.category == selectedFilter) &&
                        (selectedSeverity == "all" || it.severity == selectedSeverity)
                    }) { log ->
                        AuditLogCard(
                            log = log,
                            onLogClick = { /* Handle log click */ }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun AuditLogCard(
    log: AuditLogItem,
    onLogClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onLogClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Column(
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = log.action,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                    
                    Spacer(modifier = Modifier.height(4.dp))
                    
                    Text(
                        text = log.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                
                SeverityChip(severity = log.severity)
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Center
            ) {
                Row(
                    verticalAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Person,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = log.userId,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                Text(
                    text = formatAuditTime(log.createdAt),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            if (log.metadata.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Metadata: ${log.metadata.entries.joinToString(", ") { "${it.key}=${it.value}" }}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Composable
fun SeverityChip(severity: String) {
    val (backgroundColor, textColor) = when (severity) {
        "low" -> Color(0xFF4CAF50) to Color.White
        "medium" -> Color(0xFFFF9800) to Color.White
        "high" -> Color(0xFFF44336) to Color.White
        "critical" -> Color(0xFF9C27B0) to Color.White
        else -> MaterialTheme.colorScheme.surfaceVariant to MaterialTheme.colorScheme.onSurfaceVariant
    }
    
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(16.dp))
            .background(backgroundColor)
            .padding(horizontal = 12.dp, vertical = 4.dp)
    ) {
        Text(
            text = severity.uppercase(),
            style = MaterialTheme.typography.bodySmall,
            color = textColor,
            fontWeight = FontWeight.Medium
        )
    }
}

data class AuditLogItem(
    val id: String,
    val action: String,
    val description: String,
    val category: String,
    val severity: String,
    val userId: String,
    val ipAddress: String,
    val userAgent: String,
    val createdAt: Date,
    val metadata: Map<String, Any> = emptyMap()
)

val sampleAuditLogs = listOf(
    AuditLogItem(
        id = "AUD-001",
        action = "User Login",
        description = "User successfully logged in to the mobile app",
        category = "authentication",
        severity = "low",
        userId = "user_123",
        ipAddress = "192.168.1.100",
        userAgent = "Clutch Partners Android App",
        createdAt = Date(System.currentTimeMillis() - 5 * 60 * 1000), // 5 minutes ago
        metadata = mapOf("deviceId" to "device_456", "loginMethod" to "password")
    ),
    AuditLogItem(
        id = "AUD-002",
        action = "Order Status Updated",
        description = "Order #ORD-2024-001 status changed from 'Pending' to 'In Progress'",
        category = "orders",
        severity = "medium",
        userId = "user_123",
        ipAddress = "192.168.1.100",
        userAgent = "Clutch Partners Android App",
        createdAt = Date(System.currentTimeMillis() - 15 * 60 * 1000), // 15 minutes ago
        metadata = mapOf("orderId" to "ORD-2024-001", "oldStatus" to "Pending", "newStatus" to "In Progress")
    ),
    AuditLogItem(
        id = "AUD-003",
        action = "Payment Processed",
        description = "Weekly payment of 2,500 EGP processed successfully",
        category = "payments",
        severity = "medium",
        userId = "system",
        ipAddress = "10.0.0.1",
        userAgent = "Clutch Backend Service",
        createdAt = Date(System.currentTimeMillis() - 2 * 60 * 60 * 1000), // 2 hours ago
        metadata = mapOf("amount" to "2500", "currency" to "EGP", "paymentMethod" to "bank_transfer")
    ),
    AuditLogItem(
        id = "AUD-004",
        action = "Inventory Updated",
        description = "Product 'Brake Pads' quantity updated from 50 to 45",
        category = "inventory",
        severity = "low",
        userId = "user_123",
        ipAddress = "192.168.1.100",
        userAgent = "Clutch Partners Android App",
        createdAt = Date(System.currentTimeMillis() - 4 * 60 * 60 * 1000), // 4 hours ago
        metadata = mapOf("productId" to "PROD-001", "oldQuantity" to "50", "newQuantity" to "45")
    ),
    AuditLogItem(
        id = "AUD-005",
        action = "Settings Changed",
        description = "Business profile information updated",
        category = "settings",
        severity = "medium",
        userId = "user_123",
        ipAddress = "192.168.1.100",
        userAgent = "Clutch Partners Android App",
        createdAt = Date(System.currentTimeMillis() - 6 * 60 * 60 * 1000), // 6 hours ago
        metadata = mapOf("field" to "businessName", "oldValue" to "Old Name", "newValue" to "New Name")
    ),
    AuditLogItem(
        id = "AUD-006",
        action = "Failed Login Attempt",
        description = "Failed login attempt with invalid credentials",
        category = "authentication",
        severity = "high",
        userId = "unknown",
        ipAddress = "192.168.1.200",
        userAgent = "Clutch Partners Android App",
        createdAt = Date(System.currentTimeMillis() - 8 * 60 * 60 * 1000), // 8 hours ago
        metadata = mapOf("attemptCount" to "3", "blocked" to "true")
    ),
    AuditLogItem(
        id = "AUD-007",
        action = "Data Export",
        description = "Orders data exported to CSV format",
        category = "settings",
        severity = "medium",
        userId = "user_123",
        ipAddress = "192.168.1.100",
        userAgent = "Clutch Partners Android App",
        createdAt = Date(System.currentTimeMillis() - 12 * 60 * 60 * 1000), // 12 hours ago
        metadata = mapOf("exportType" to "orders", "format" to "CSV", "recordCount" to "150")
    ),
    AuditLogItem(
        id = "AUD-008",
        action = "System Error",
        description = "Critical system error occurred during payment processing",
        category = "payments",
        severity = "critical",
        userId = "system",
        ipAddress = "10.0.0.1",
        userAgent = "Clutch Backend Service",
        createdAt = Date(System.currentTimeMillis() - 24 * 60 * 60 * 1000), // 1 day ago
        metadata = mapOf("errorCode" to "PAY_001", "affectedUsers" to "5", "resolved" to "true")
    )
)

fun formatAuditTime(date: Date): String {
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
