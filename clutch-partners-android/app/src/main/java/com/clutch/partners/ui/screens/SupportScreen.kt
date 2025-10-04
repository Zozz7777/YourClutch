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
fun SupportScreen() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Tickets", "Live Chat", "FAQ")
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(16.dp)
        ) {
            // Header
            Text(
                text = if (isRTL) "الدعم الفني" else "Support",
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
                0 -> SupportTicketsScreen(isRTL = isRTL)
                1 -> LiveChatScreen(isRTL = isRTL)
                2 -> FAQScreen(isRTL = isRTL)
            }
        }
    }
}

@Composable
fun SupportTicketsScreen(isRTL: Boolean) {
    var showCreateTicket by remember { mutableStateOf(false) }
    
    Column {
        // Create Ticket Button
        Button(
            onClick = { showCreateTicket = true },
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
                text = if (isRTL) "إنشاء تذكرة جديدة" else "Create New Ticket",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Tickets List
        TicketsList(isRTL = isRTL)
    }
    
    if (showCreateTicket) {
        CreateTicketDialog(
            onDismiss = { showCreateTicket = false },
            onSubmit = { title, description, priority -> 
                // TODO: Submit ticket
                showCreateTicket = false
            }
        )
    }
}

@Composable
fun LiveChatScreen(isRTL: Boolean) {
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
                Icons.Filled.Chat,
                contentDescription = null,
                modifier = Modifier.size(60.dp),
                tint = PartnersBlue
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = if (isRTL) "الدردشة المباشرة" else "Live Chat",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = if (isRTL) "تحدث مع فريق الدعم مباشرة" else "Chat with our support team directly",
                fontSize = 14.sp,
                color = if (isRTL) DarkMutedForeground else LightMutedForeground,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Button(
                onClick = { /* TODO: Start live chat */ },
                colors = ButtonDefaults.buttonColors(
                    containerColor = PartnersBlue
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = if (isRTL) "بدء المحادثة" else "Start Chat",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun FAQScreen(isRTL: Boolean) {
    val faqItems = listOf(
        FAQItem(
            question = if (isRTL) "كيف يمكنني إضافة منتج جديد؟" else "How can I add a new product?",
            answer = if (isRTL) "يمكنك إضافة منتج جديد من خلال قسم إدارة المخزون" else "You can add a new product through the inventory management section"
        ),
        FAQItem(
            question = if (isRTL) "كيف يمكنني تتبع الطلبات؟" else "How can I track orders?",
            answer = if (isRTL) "يمكنك تتبع الطلبات من خلال الصفحة الرئيسية" else "You can track orders through the home screen"
        ),
        FAQItem(
            question = if (isRTL) "كيف يمكنني تحديث معلومات المتجر؟" else "How can I update store information?",
            answer = if (isRTL) "يمكنك تحديث معلومات المتجر من إعدادات المتجر" else "You can update store information from store settings"
        )
    )
    
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(faqItems) { faq ->
            FAQCard(faq = faq, isRTL = isRTL)
        }
    }
}

@Composable
fun TicketsList(isRTL: Boolean) {
    val tickets = listOf(
        SupportTicket(
            id = "TKT-001",
            title = if (isRTL) "مشكلة في الدفع" else "Payment Issue",
            description = if (isRTL) "لا يمكنني استلام الدفعة" else "Cannot receive payment",
            status = TicketStatus.OPEN,
            priority = TicketPriority.HIGH,
            createdAt = Date()
        ),
        SupportTicket(
            id = "TKT-002",
            title = if (isRTL) "طلب مساعدة تقنية" else "Technical Support Request",
            description = if (isRTL) "التطبيق لا يعمل بشكل صحيح" else "App not working properly",
            status = TicketStatus.IN_PROGRESS,
            priority = TicketPriority.MEDIUM,
            createdAt = Date()
        ),
        SupportTicket(
            id = "TKT-003",
            title = if (isRTL) "استفسار عام" else "General Inquiry",
            description = if (isRTL) "كيف يمكنني تحسين أداء المتجر؟" else "How can I improve store performance?",
            status = TicketStatus.CLOSED,
            priority = TicketPriority.LOW,
            createdAt = Date()
        )
    )
    
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(tickets) { ticket ->
            TicketCard(ticket = ticket, isRTL = isRTL)
        }
    }
}

@Composable
fun TicketCard(
    ticket: SupportTicket,
    isRTL: Boolean
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { /* TODO: Navigate to ticket details */ },
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
                    text = ticket.id,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isRTL) DarkForeground else LightForeground
                )
                
                TicketStatusChip(
                    status = ticket.status,
                    isRTL = isRTL
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = ticket.title,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                color = if (isRTL) DarkForeground else LightForeground
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = ticket.description,
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
                    text = formatDate(ticket.createdAt, isRTL),
                    fontSize = 12.sp,
                    color = if (isRTL) DarkMutedForeground else LightMutedForeground
                )
                
                TicketPriorityChip(
                    priority = ticket.priority,
                    isRTL = isRTL
                )
            }
        }
    }
}

@Composable
fun FAQCard(
    faq: FAQItem,
    isRTL: Boolean
) {
    var isExpanded by remember { mutableStateOf(false) }
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { isExpanded = !isExpanded },
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
                    text = faq.question,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (isRTL) DarkForeground else LightForeground,
                    modifier = Modifier.weight(1f)
                )
                
                Icon(
                    imageVector = if (isExpanded) Icons.Filled.ExpandLess else Icons.Filled.ExpandMore,
                    contentDescription = null,
                    tint = PartnersBlue
                )
            }
            
            if (isExpanded) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = faq.answer,
                    fontSize = 14.sp,
                    color = if (isRTL) DarkMutedForeground else LightMutedForeground,
                    lineHeight = 20.sp
                )
            }
        }
    }
}

@Composable
fun CreateTicketDialog(
    onDismiss: () -> Unit,
    onSubmit: (String, String, TicketPriority) -> Unit
) {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var priority by remember { mutableStateOf(TicketPriority.MEDIUM) }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (isRTL) "إنشاء تذكرة جديدة" else "Create New Ticket") },
        text = {
            Column {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text(if (isRTL) "العنوان" else "Title") },
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
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSubmit(title, description, priority)
                    onDismiss()
                },
                enabled = title.isNotEmpty() && description.isNotEmpty()
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
fun TicketStatusChip(
    status: TicketStatus,
    isRTL: Boolean
) {
    val (text, color) = when (status) {
        TicketStatus.OPEN -> Pair(if (isRTL) "مفتوح" else "Open", LightWarning)
        TicketStatus.IN_PROGRESS -> Pair(if (isRTL) "قيد التنفيذ" else "In Progress", PartnersBlue)
        TicketStatus.CLOSED -> Pair(if (isRTL) "مغلق" else "Closed", LightSuccess)
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
fun TicketPriorityChip(
    priority: TicketPriority,
    isRTL: Boolean
) {
    val (text, color) = when (priority) {
        TicketPriority.LOW -> Pair(if (isRTL) "منخفض" else "Low", LightSuccess)
        TicketPriority.MEDIUM -> Pair(if (isRTL) "متوسط" else "Medium", LightWarning)
        TicketPriority.HIGH -> Pair(if (isRTL) "عالي" else "High", LightDestructive)
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

fun formatDate(date: Date, isRTL: Boolean): String {
    // Simple date formatting - in real app would use proper date formatting
    return if (isRTL) "منذ يومين" else "2 days ago"
}

data class SupportTicket(
    val id: String,
    val title: String,
    val description: String,
    val status: TicketStatus,
    val priority: TicketPriority,
    val createdAt: Date
)

data class FAQItem(
    val question: String,
    val answer: String
)

enum class TicketStatus {
    OPEN, IN_PROGRESS, CLOSED
}

enum class TicketPriority {
    LOW, MEDIUM, HIGH
}
