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
fun WarrantyDisputesScreen() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Warranty Claims", "Disputes", "Escalations")
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(16.dp)
        ) {
            // Header
            Text(
                text = if (isRTL) "الضمان والنزاعات" else "Warranty & Disputes",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Tabs
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color.Transparent,
                contentColor = PartnersBlue
            ) {
                tabs.forEachIndexed { index, tab ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = { Text(tab) }
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Content
            when (selectedTab) {
                0 -> WarrantyClaimsScreen(isRTL = isRTL)
                1 -> DisputesScreen(isRTL = isRTL)
                2 -> EscalationsScreen(isRTL = isRTL)
            }
        }
    }
}

@Composable
fun WarrantyClaimsScreen(isRTL: Boolean) {
    var showNewClaim by remember { mutableStateOf(false) }
    
    Column {
        // New Claim Button
        Button(
            onClick = { showNewClaim = true },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = PartnersBlue
            ),
            shape = RoundedCornerShape(12.dp)
        ) {
            Icon(
                Icons.Filled.Add,
                contentDescription = null,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = if (isRTL) "إضافة مطالبة ضمان جديدة" else "Submit New Warranty Claim",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Warranty Claims List
        WarrantyClaimsList(isRTL = isRTL)
    }
    
    if (showNewClaim) {
        NewWarrantyClaimDialog(
            onDismiss = { showNewClaim = false },
            onSubmit = { orderId, productName, issue, amount ->
                // TODO: Submit warranty claim
                showNewClaim = false
            }
        )
    }
}

@Composable
fun DisputesScreen(isRTL: Boolean) {
    var showNewDispute by remember { mutableStateOf(false) }
    
    Column {
        // New Dispute Button
        Button(
            onClick = { showNewDispute = true },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = LightDestructive
            ),
            shape = RoundedCornerShape(12.dp)
        ) {
            Icon(
                Icons.Filled.Gavel,
                contentDescription = null,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = if (isRTL) "إضافة نزاع جديد" else "Submit New Dispute",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Disputes List
        DisputesList(isRTL = isRTL)
    }
    
    if (showNewDispute) {
        NewDisputeDialog(
            onDismiss = { showNewDispute = false },
            onSubmit = { orderId, reason, description, amount ->
                // TODO: Submit dispute
                showNewDispute = false
            }
        )
    }
}

@Composable
fun EscalationsScreen(isRTL: Boolean) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (isRTL) DarkCard else LightCard
        ),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                Icons.Filled.Escalator,
                contentDescription = null,
                modifier = Modifier.size(60.dp),
                tint = LightWarning
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = if (isRTL) "التصعيد إلى الإدارة" else "Escalate to Admin",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = if (isRTL) "تصعيد النزاعات غير المحلولة إلى إدارة Clutch" else "Escalate unresolved disputes to Clutch Admin",
                fontSize = 14.sp,
                color = if (isRTL) DarkMutedForeground else LightMutedForeground,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Button(
                onClick = { /* TODO: Escalate to admin */ },
                colors = ButtonDefaults.buttonColors(
                    containerColor = LightWarning
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = if (isRTL) "تصعيد النزاع" else "Escalate Dispute",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun WarrantyClaimsList(isRTL: Boolean) {
    val warrantyClaims = listOf(
        WarrantyClaim(
            id = "WC-001",
            orderId = "ORD-001",
            productName = if (isRTL) "محرك BMW X5" else "BMW X5 Engine",
            issue = if (isRTL) "مشكلة في التشغيل" else "Starting Issue",
            status = WarrantyStatus.PENDING,
            submittedDate = Date(),
            customerName = if (isRTL) "أحمد محمد" else "Ahmed Mohamed",
            amount = 2500.0
        ),
        WarrantyClaim(
            id = "WC-002",
            orderId = "ORD-002",
            productName = if (isRTL) "فرامل مرسيدس" else "Mercedes Brakes",
            issue = if (isRTL) "صوت صرير" else "Squeaking Noise",
            status = WarrantyStatus.APPROVED,
            submittedDate = Date(),
            customerName = if (isRTL) "فاطمة علي" else "Fatima Ali",
            amount = 800.0
        ),
        WarrantyClaim(
            id = "WC-003",
            orderId = "ORD-003",
            productName = if (isRTL) "صندوق تروس أودي" else "Audi Gearbox",
            issue = if (isRTL) "مشكلة في التغيير" else "Shifting Problem",
            status = WarrantyStatus.REJECTED,
            submittedDate = Date(),
            customerName = if (isRTL) "محمد أحمد" else "Mohamed Ahmed",
            amount = 1500.0
        )
    )
    
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(warrantyClaims) { claim ->
            WarrantyClaimCard(claim = claim, isRTL = isRTL)
        }
    }
}

@Composable
fun DisputesList(isRTL: Boolean) {
    val disputes = listOf(
        Dispute(
            id = "DIS-001",
            orderId = "ORD-001",
            reason = if (isRTL) "جودة المنتج" else "Product Quality",
            description = if (isRTL) "المنتج لا يعمل كما هو متوقع" else "Product not working as expected",
            status = DisputeStatus.OPEN,
            submittedDate = Date(),
            customerName = if (isRTL) "أحمد محمد" else "Ahmed Mohamed",
            amount = 2500.0
        ),
        Dispute(
            id = "DIS-002",
            orderId = "ORD-002",
            reason = if (isRTL) "تأخير التسليم" else "Delivery Delay",
            description = if (isRTL) "تأخر تسليم الطلب لمدة أسبوع" else "Order delivery delayed by one week",
            status = DisputeStatus.IN_PROGRESS,
            submittedDate = Date(),
            customerName = if (isRTL) "فاطمة علي" else "Fatima Ali",
            amount = 800.0
        ),
        Dispute(
            id = "DIS-003",
            orderId = "ORD-003",
            reason = if (isRTL) "سعر غير متفق عليه" else "Price Disagreement",
            description = if (isRTL) "السعر النهائي يختلف عن المتفق عليه" else "Final price differs from agreed price",
            status = DisputeStatus.RESOLVED,
            submittedDate = Date(),
            customerName = if (isRTL) "محمد أحمد" else "Mohamed Ahmed",
            amount = 1500.0
        )
    )
    
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(disputes) { dispute ->
            DisputeCard(dispute = dispute, isRTL = isRTL)
        }
    }
}

@Composable
fun WarrantyClaimCard(
    claim: WarrantyClaim,
    isRTL: Boolean
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* TODO: Navigate to claim details */ },
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
                    text = claim.id,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isRTL) DarkForeground else LightForeground
                )
                
                WarrantyStatusChip(
                    status = claim.status,
                    isRTL = isRTL
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = claim.productName,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = claim.issue,
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
                    text = "₪${String.format("%.2f", claim.amount)}",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = PartnersBlue
                )
                
                Text(
                    text = formatWarrantyDate(claim.submittedDate, isRTL),
                    fontSize = 12.sp,
                    color = if (isRTL) DarkMutedForeground else LightMutedForeground
                )
            }
        }
    }
}

@Composable
fun DisputeCard(
    dispute: Dispute,
    isRTL: Boolean
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* TODO: Navigate to dispute details */ },
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
                    text = dispute.id,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isRTL) DarkForeground else LightForeground
                )
                
                DisputeStatusChip(
                    status = dispute.status,
                    isRTL = isRTL
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = dispute.reason,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = dispute.description,
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
                    text = "₪${String.format("%.2f", dispute.amount)}",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = LightDestructive
                )
                
                Text(
                    text = formatDisputeDate(dispute.submittedDate, isRTL),
                    fontSize = 12.sp,
                    color = if (isRTL) DarkMutedForeground else LightMutedForeground
                )
            }
        }
    }
}

@Composable
fun NewWarrantyClaimDialog(
    onDismiss: () -> Unit,
    onSubmit: (String, String, String, String) -> Unit
) {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    
    var orderId by remember { mutableStateOf("") }
    var productName by remember { mutableStateOf("") }
    var issue by remember { mutableStateOf("") }
    var amount by remember { mutableStateOf("") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (isRTL) "إضافة مطالبة ضمان جديدة" else "Submit New Warranty Claim") },
        text = {
            Column {
                OutlinedTextField(
                    value = orderId,
                    onValueChange = { orderId = it },
                    label = { Text(if (isRTL) "رقم الطلب" else "Order ID") },
                    modifier = Modifier.fillMaxWidth()
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                OutlinedTextField(
                    value = productName,
                    onValueChange = { productName = it },
                    label = { Text(if (isRTL) "اسم المنتج" else "Product Name") },
                    modifier = Modifier.fillMaxWidth()
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                OutlinedTextField(
                    value = issue,
                    onValueChange = { issue = it },
                    label = { Text(if (isRTL) "المشكلة" else "Issue") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                OutlinedTextField(
                    value = amount,
                    onValueChange = { amount = it },
                    label = { Text(if (isRTL) "المبلغ" else "Amount") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSubmit(orderId, productName, issue, amount)
                    onDismiss()
                },
                enabled = orderId.isNotEmpty() && productName.isNotEmpty() && issue.isNotEmpty() && amount.isNotEmpty()
            ) {
                Text(if (isRTL) "إرسال" else "Submit")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(if (isRTL) "إلغاء" else "Cancel")
            }
        }
    )
}

@Composable
fun NewDisputeDialog(
    onDismiss: () -> Unit,
    onSubmit: (String, String, String, String) -> Unit
) {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    
    var orderId by remember { mutableStateOf("") }
    var reason by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var amount by remember { mutableStateOf("") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (isRTL) "إضافة نزاع جديد" else "Submit New Dispute") },
        text = {
            Column {
                OutlinedTextField(
                    value = orderId,
                    onValueChange = { orderId = it },
                    label = { Text(if (isRTL) "رقم الطلب" else "Order ID") },
                    modifier = Modifier.fillMaxWidth()
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                OutlinedTextField(
                    value = reason,
                    onValueChange = { reason = it },
                    label = { Text(if (isRTL) "سبب النزاع" else "Dispute Reason") },
                    modifier = Modifier.fillMaxWidth()
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text(if (isRTL) "الوصف" else "Description") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                OutlinedTextField(
                    value = amount,
                    onValueChange = { amount = it },
                    label = { Text(if (isRTL) "المبلغ" else "Amount") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSubmit(orderId, reason, description, amount)
                    onDismiss()
                },
                enabled = orderId.isNotEmpty() && reason.isNotEmpty() && description.isNotEmpty() && amount.isNotEmpty()
            ) {
                Text(if (isRTL) "إرسال" else "Submit")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(if (isRTL) "إلغاء" else "Cancel")
            }
        }
    )
}

@Composable
fun WarrantyStatusChip(
    status: WarrantyStatus,
    isRTL: Boolean
) {
    val (text, color) = when (status) {
        WarrantyStatus.PENDING -> Pair(if (isRTL) "معلق" else "Pending", LightWarning)
        WarrantyStatus.APPROVED -> Pair(if (isRTL) "موافق عليه" else "Approved", LightSuccess)
        WarrantyStatus.REJECTED -> Pair(if (isRTL) "مرفوض" else "Rejected", LightDestructive)
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
fun DisputeStatusChip(
    status: DisputeStatus,
    isRTL: Boolean
) {
    val (text, color) = when (status) {
        DisputeStatus.OPEN -> Pair(if (isRTL) "مفتوح" else "Open", LightDestructive)
        DisputeStatus.IN_PROGRESS -> Pair(if (isRTL) "قيد التنفيذ" else "In Progress", LightWarning)
        DisputeStatus.RESOLVED -> Pair(if (isRTL) "محلول" else "Resolved", LightSuccess)
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

fun formatWarrantyDate(date: Date, isRTL: Boolean): String {
    return if (isRTL) "منذ 3 أيام" else "3 days ago"
}

fun formatDisputeDate(date: Date, isRTL: Boolean): String {
    return if (isRTL) "منذ 5 أيام" else "5 days ago"
}

data class WarrantyClaim(
    val id: String,
    val orderId: String,
    val productName: String,
    val issue: String,
    val status: WarrantyStatus,
    val submittedDate: Date,
    val customerName: String,
    val amount: Double
)

data class Dispute(
    val id: String,
    val orderId: String,
    val reason: String,
    val description: String,
    val status: DisputeStatus,
    val submittedDate: Date,
    val customerName: String,
    val amount: Double
)

enum class WarrantyStatus {
    PENDING, APPROVED, REJECTED
}

enum class DisputeStatus {
    OPEN, IN_PROGRESS, RESOLVED
}
