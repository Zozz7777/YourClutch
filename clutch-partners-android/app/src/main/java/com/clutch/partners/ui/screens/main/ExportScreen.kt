package com.clutch.partners.ui.screens.main

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Alignment.Companion.CenterVertically
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
fun ExportScreen(
    navController: NavController,
    viewModel: MainViewModel = hiltViewModel()
) {
    var selectedDataset by remember { mutableStateOf("orders") }
    var selectedFormat by remember { mutableStateOf("csv") }
    var selectedDateRange by remember { mutableStateOf("this_month") }
    var showExportDialog by remember { mutableStateOf(false) }
    
    ClutchPartnersTheme {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { 
                        Text(
                            "Data Export",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold
                        )
                    },
                    actions = {
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
                // Export options
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = "Export Options",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Dataset selection
                        Text(
                            text = "Dataset",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(listOf("orders", "invoices", "payments", "inventory", "customers", "staff_actions")) { dataset ->
                                FilterChip(
                                    onClick = { selectedDataset = dataset },
                                    label = { 
                                        Text(
                                            dataset.replace("_", " ").replaceFirstChar { it.uppercase() },
                                            style = MaterialTheme.typography.bodySmall
                                        )
                                    },
                                    selected = selectedDataset == dataset,
                                    modifier = Modifier.clip(RoundedCornerShape(20.dp))
                                )
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Format selection
                        Text(
                            text = "Format",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            listOf("csv", "excel", "pdf").forEach { format ->
                                FilterChip(
                                    onClick = { selectedFormat = format },
                                    label = { 
                                        Text(
                                            format.uppercase(),
                                            style = MaterialTheme.typography.bodySmall
                                        )
                                    },
                                    selected = selectedFormat == format,
                                    modifier = Modifier.clip(RoundedCornerShape(20.dp))
                                )
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Date range selection
                        Text(
                            text = "Date Range",
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(listOf("today", "yesterday", "this_week", "last_week", "this_month", "last_month", "this_year", "last_year")) { range ->
                                FilterChip(
                                    onClick = { selectedDateRange = range },
                                    label = { 
                                        Text(
                                            range.replace("_", " ").replaceFirstChar { it.uppercase() },
                                            style = MaterialTheme.typography.bodySmall
                                        )
                                    },
                                    selected = selectedDateRange == range,
                                    modifier = Modifier.clip(RoundedCornerShape(20.dp))
                                )
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Export button
                        Button(
                            onClick = { showExportDialog = true },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.Download, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Export Data")
                        }
                    }
                }
                
                // Recent exports
                Text(
                    text = "Recent Exports",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )
                
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(sampleExports) { export ->
                        ExportCard(
                            export = export,
                            onExportClick = { /* Handle export click */ }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ExportCard(
    export: ExportItem,
    onExportClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onExportClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
        ) {
            // Export icon
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(
                        when (export.format) {
                            "csv" -> Color(0xFF4CAF50)
                            "excel" -> Color(0xFF2196F3)
                            "pdf" -> Color(0xFFF44336)
                            else -> MaterialTheme.colorScheme.primary
                        }
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = when (export.format) {
                        "csv" -> Icons.Default.TableChart
                        "excel" -> Icons.Default.TableChart
                        "pdf" -> Icons.Default.PictureAsPdf
                        else -> Icons.Default.Download
                    },
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            // Export details
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = export.dataset.replace("_", " ").replaceFirstChar { it.uppercase() },
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = "${export.format.uppercase()} • ${export.recordCount} records",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = formatExportTime(export.createdAt),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            // Status chip
            ExportStatusChip(status = export.status)
        }
    }
}

@Composable
fun ExportStatusChip(status: String) {
    val (backgroundColor, textColor) = when (status) {
        "Completed" -> Color(0xFF4CAF50) to Color.White
        "Processing" -> Color(0xFF2196F3) to Color.White
        "Failed" -> Color(0xFFF44336) to Color.White
        "Scheduled" -> Color(0xFFFF9800) to Color.White
        else -> MaterialTheme.colorScheme.surfaceVariant to MaterialTheme.colorScheme.onSurfaceVariant
    }
    
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(16.dp))
            .background(backgroundColor)
            .padding(horizontal = 12.dp, vertical = 4.dp)
    ) {
        Text(
            text = status,
            style = MaterialTheme.typography.bodySmall,
            color = textColor,
            fontWeight = FontWeight.Medium
        )
    }
}

data class ExportItem(
    val id: String,
    val dataset: String,
    val format: String,
    val recordCount: Int,
    val status: String,
    val createdAt: Date,
    val fileSize: String? = null,
    val downloadUrl: String? = null
)

val sampleExports = listOf(
    ExportItem(
        id = "EXP-001",
        dataset = "orders",
        format = "csv",
        recordCount = 150,
        status = "Completed",
        createdAt = Date(System.currentTimeMillis() - 2 * 60 * 1000), // 2 minutes ago
        fileSize = "2.3 MB",
        downloadUrl = "https://example.com/exports/orders_2024-01-15.csv"
    ),
    ExportItem(
        id = "EXP-002",
        dataset = "payments",
        format = "excel",
        recordCount = 75,
        status = "Completed",
        createdAt = Date(System.currentTimeMillis() - 1 * 60 * 60 * 1000), // 1 hour ago
        fileSize = "1.8 MB",
        downloadUrl = "https://example.com/exports/payments_2024-01-15.xlsx"
    ),
    ExportItem(
        id = "EXP-003",
        dataset = "inventory",
        format = "pdf",
        recordCount = 300,
        status = "Processing",
        createdAt = Date(System.currentTimeMillis() - 5 * 60 * 1000), // 5 minutes ago
        fileSize = null,
        downloadUrl = null
    ),
    ExportItem(
        id = "EXP-004",
        dataset = "customers",
        format = "csv",
        recordCount = 200,
        status = "Failed",
        createdAt = Date(System.currentTimeMillis() - 2 * 60 * 60 * 1000), // 2 hours ago
        fileSize = null,
        downloadUrl = null
    ),
    ExportItem(
        id = "EXP-005",
        dataset = "staff_actions",
        format = "excel",
        recordCount = 500,
        status = "Completed",
        createdAt = Date(System.currentTimeMillis() - 24 * 60 * 60 * 1000), // 1 day ago
        fileSize = "4.2 MB",
        downloadUrl = "https://example.com/exports/staff_actions_2024-01-14.xlsx"
    ),
    ExportItem(
        id = "EXP-006",
        dataset = "invoices",
        format = "pdf",
        recordCount = 100,
        status = "Scheduled",
        createdAt = Date(System.currentTimeMillis() - 3 * 60 * 60 * 1000), // 3 hours ago
        fileSize = null,
        downloadUrl = null
    )
)

fun formatExportTime(date: Date): String {
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
