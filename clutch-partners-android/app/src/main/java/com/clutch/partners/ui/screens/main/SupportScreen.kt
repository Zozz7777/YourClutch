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
fun SupportScreen(
    navController: NavController,
    viewModel: MainViewModel = hiltViewModel()
) {
    var selectedTab by remember { mutableStateOf(0) }
    var showCreateTicket by remember { mutableStateOf(false) }
    
    ClutchPartnersTheme {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { 
                        Text(
                            "Support",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold
                        )
                    },
                    actions = {
                        IconButton(onClick = { showCreateTicket = true }) {
                            Icon(Icons.Default.Add, contentDescription = "Create Ticket")
                        }
                    }
                )
            },
            floatingActionButton = {
                FloatingActionButton(
                    onClick = { showCreateTicket = true },
                    containerColor = MaterialTheme.colorScheme.primary
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Create Ticket")
                }
            }
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .background(MaterialTheme.colorScheme.background)
            ) {
                // Tab row
                TabRow(
                    selectedTabIndex = selectedTab,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    listOf("My Tickets", "FAQ", "Live Chat").forEachIndexed { index, title ->
                        Tab(
                            selected = selectedTab == index,
                            onClick = { selectedTab = index },
                            text = { 
                                Text(
                                    title,
                                    style = MaterialTheme.typography.bodyMedium,
                                    fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal
                                )
                            }
                        )
                    }
                }
                
                // Content based on selected tab
                when (selectedTab) {
                    0 -> MyTicketsContent()
                    1 -> FAQContent()
                    2 -> LiveChatContent()
                }
            }
        }
    }
}

@Composable
fun MyTicketsContent() {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(sampleTickets) { ticket ->
            TicketCard(
                ticket = ticket,
                onTicketClick = { /* Handle ticket click */ }
            )
        }
    }
}

@Composable
fun FAQContent() {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(sampleFAQs) { faq ->
            FAQCard(
                faq = faq,
                onFAQClick = { /* Handle FAQ click */ }
            )
        }
    }
}

@Composable
fun LiveChatContent() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.Chat,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Live Chat Support",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = "Get instant help from our support team",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = { /* Start live chat */ },
            modifier = Modifier.fillMaxWidth()
        ) {
            Icon(Icons.Default.Chat, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Start Chat")
        }
    }
}

@Composable
fun TicketCard(
    ticket: SupportTicket,
    onTicketClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onTicketClick() },
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
                Text(
                    text = ticket.subject,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
                
                StatusChip(status = ticket.status)
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = ticket.description,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Center
            ) {
                Text(
                    text = "Ticket #${ticket.id}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                Text(
                    text = formatTicketTime(ticket.createdAt),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun FAQCard(
    faq: FAQItem,
    onFAQClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onFAQClick() },
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
                verticalAlignment = Alignment.Center
            ) {
                Text(
                    text = faq.question,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.weight(1f)
                )
                
                Icon(
                    imageVector = Icons.Default.KeyboardArrowDown,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun StatusChip(status: String) {
    val (backgroundColor, textColor) = when (status) {
        "Open" -> Color(0xFF4CAF50) to Color.White
        "In Progress" -> Color(0xFF2196F3) to Color.White
        "Resolved" -> Color(0xFF9C27B0) to Color.White
        "Closed" -> Color(0xFF757575) to Color.White
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

data class SupportTicket(
    val id: String,
    val subject: String,
    val description: String,
    val status: String,
    val priority: String,
    val type: String,
    val createdAt: Date,
    val updatedAt: Date,
    val assignedTo: String? = null,
    val messageCount: Int = 0
)

data class FAQItem(
    val id: String,
    val question: String,
    val answer: String,
    val category: String
)

val sampleTickets = listOf(
    SupportTicket(
        id = "TKT-001",
        subject = "Login Issue",
        description = "Unable to login to the mobile app. Getting error message 'Invalid credentials'",
        status = "Open",
        priority = "High",
        type = "Technical Issue",
        createdAt = Date(System.currentTimeMillis() - 2 * 60 * 60 * 1000), // 2 hours ago
        updatedAt = Date(System.currentTimeMillis() - 2 * 60 * 60 * 1000),
        messageCount = 3
    ),
    SupportTicket(
        id = "TKT-002",
        subject = "Payment Question",
        description = "When will my weekly payment be processed?",
        status = "In Progress",
        priority = "Normal",
        type = "Billing Question",
        createdAt = Date(System.currentTimeMillis() - 24 * 60 * 60 * 1000), // 1 day ago
        updatedAt = Date(System.currentTimeMillis() - 6 * 60 * 60 * 1000), // 6 hours ago
        assignedTo = "Support Team",
        messageCount = 5
    ),
    SupportTicket(
        id = "TKT-003",
        subject = "Feature Request",
        description = "Would like to request a dark mode feature for the app",
        status = "Resolved",
        priority = "Low",
        type = "Feature Request",
        createdAt = Date(System.currentTimeMillis() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        updatedAt = Date(System.currentTimeMillis() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        messageCount = 8
    )
)

val sampleFAQs = listOf(
    FAQItem(
        id = "FAQ-001",
        question = "How do I reset my password?",
        answer = "Go to the login screen and tap 'Forgot Password'. Enter your email address and follow the instructions sent to your email.",
        category = "Account"
    ),
    FAQItem(
        id = "FAQ-002",
        question = "When are payments processed?",
        answer = "Weekly payments are processed every Monday and typically arrive in your account within 2-3 business days.",
        category = "Payments"
    ),
    FAQItem(
        id = "FAQ-003",
        question = "How do I update my business information?",
        answer = "Go to Settings > Store Settings > Profile to update your business information, address, and contact details.",
        category = "Profile"
    ),
    FAQItem(
        id = "FAQ-004",
        question = "What should I do if an order is missing?",
        answer = "Contact our support team immediately with the order number. We'll investigate and provide a resolution within 24 hours.",
        category = "Orders"
    ),
    FAQItem(
        id = "FAQ-005",
        question = "How do I enable notifications?",
        answer = "Go to Settings > Notifications to customize your notification preferences for orders, payments, and system updates.",
        category = "Settings"
    )
)

fun formatTicketTime(date: Date): String {
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
