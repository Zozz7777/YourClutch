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
fun DataExportScreen() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    var selectedExportType by remember { mutableStateOf(0) }
    val exportTypes = listOf("Orders", "Invoices", "Payments", "Staff Actions", "All Data")
    
    var selectedFormat by remember { mutableStateOf(0) }
    val formats = listOf("CSV", "Excel", "PDF")
    
    var selectedDateRange by remember { mutableStateOf(0) }
    val dateRanges = listOf("Last 7 days", "Last 30 days", "Last 3 months", "Last year", "All time")
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(16.dp)
        ) {
            // Header
            Text(
                text = if (isRTL) "تصدير البيانات" else "Data Export",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Export Type Selection
            Text(
                text = if (isRTL) "نوع البيانات" else "Data Type",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                exportTypes.forEachIndexed { index, type ->
                    FilterChip(
                        onClick = { selectedExportType = index },
                        label = { Text(type) },
                        selected = selectedExportType == index,
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PartnersBlue,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Format Selection
            Text(
                text = if (isRTL) "تنسيق الملف" else "File Format",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                formats.forEachIndexed { index, format ->
                    FilterChip(
                        onClick = { selectedFormat = index },
                        label = { Text(format) },
                        selected = selectedFormat == index,
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = LightSecondary,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Date Range Selection
            Text(
                text = if (isRTL) "الفترة الزمنية" else "Date Range",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                dateRanges.forEachIndexed { index, range ->
                    FilterChip(
                        onClick = { selectedDateRange = index },
                        label = { Text(range) },
                        selected = selectedDateRange == index,
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = LightAccent,
                            selectedLabelColor = Color.White
                        )
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // Export Button
            Button(
                onClick = { /* TODO: Start export */ },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = PartnersBlue
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(
                    Icons.Filled.Download,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isRTL) "بدء التصدير" else "Start Export",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Export History
            Text(
                text = if (isRTL) "تاريخ التصدير" else "Export History",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            ExportHistoryList(isRTL = isRTL)
        }
    }
}

@Composable
fun ExportHistoryList(isRTL: Boolean) {
    val exportHistory = listOf(
        ExportRecord(
            id = "EXP-001",
            type = if (isRTL) "الطلبات" else "Orders",
            format = "CSV",
            dateRange = if (isRTL) "آخر 30 يوم" else "Last 30 days",
            status = ExportStatus.COMPLETED,
            fileSize = "2.5 MB",
            downloadUrl = "https://example.com/export1.csv",
            createdAt = Date()
        ),
        ExportRecord(
            id = "EXP-002",
            type = if (isRTL) "الفواتير" else "Invoices",
            format = "Excel",
            dateRange = if (isRTL) "آخر 7 أيام" else "Last 7 days",
            status = ExportStatus.COMPLETED,
            fileSize = "1.8 MB",
            downloadUrl = "https://example.com/export2.xlsx",
            createdAt = Date()
        ),
        ExportRecord(
            id = "EXP-003",
            type = if (isRTL) "المدفوعات" else "Payments",
            format = "PDF",
            dateRange = if (isRTL) "آخر 3 أشهر" else "Last 3 months",
            status = ExportStatus.IN_PROGRESS,
            fileSize = "0 MB",
            downloadUrl = "",
            createdAt = Date()
        ),
        ExportRecord(
            id = "EXP-004",
            type = if (isRTL) "جميع البيانات" else "All Data",
            format = "CSV",
            dateRange = if (isRTL) "جميع الأوقات" else "All time",
            status = ExportStatus.FAILED,
            fileSize = "0 MB",
            downloadUrl = "",
            createdAt = Date()
        )
    )
    
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(exportHistory) { record ->
            ExportRecordCard(record = record, isRTL = isRTL)
        }
    }
}

@Composable
fun ExportRecordCard(
    record: ExportRecord,
    isRTL: Boolean
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* TODO: Handle export record click */ },
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
                    text = record.id,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isRTL) DarkMutedForeground else LightMutedForeground
                )
                
                ExportStatusChip(
                    status = record.status,
                    isRTL = isRTL
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = record.type,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "${record.format} • ${record.dateRange}",
                    fontSize = 14.sp,
                    color = if (isRTL) DarkMutedForeground else LightMutedForeground
                )
                
                Text(
                    text = record.fileSize,
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
                Text(
                    text = formatExportDate(record.createdAt, isRTL),
                    fontSize = 12.sp,
                    color = if (isRTL) DarkMutedForeground else LightMutedForeground
                )
                
                if (record.status == ExportStatus.COMPLETED && record.downloadUrl.isNotEmpty()) {
                    Button(
                        onClick = { /* TODO: Download file */ },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = PartnersBlue
                        ),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.height(32.dp)
                    ) {
                        Icon(
                            Icons.Filled.Download,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = if (isRTL) "تحميل" else "Download",
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ExportStatusChip(
    status: ExportStatus,
    isRTL: Boolean
) {
    val (text, color) = when (status) {
        ExportStatus.COMPLETED -> Pair(if (isRTL) "مكتمل" else "Completed", LightSuccess)
        ExportStatus.IN_PROGRESS -> Pair(if (isRTL) "قيد التنفيذ" else "In Progress", LightWarning)
        ExportStatus.FAILED -> Pair(if (isRTL) "فشل" else "Failed", LightDestructive)
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

fun formatExportDate(date: Date, isRTL: Boolean): String {
    return if (isRTL) "منذ ساعتين" else "2 hours ago"
}

data class ExportRecord(
    val id: String,
    val type: String,
    val format: String,
    val dateRange: String,
    val status: ExportStatus,
    val fileSize: String,
    val downloadUrl: String,
    val createdAt: Date
)

enum class ExportStatus {
    COMPLETED, IN_PROGRESS, FAILED
}
