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
fun WarrantyScreen(
    navController: NavController,
    viewModel: MainViewModel = hiltViewModel()
) {
    var selectedTab by remember { mutableStateOf(0) }
    var showCreateClaim by remember { mutableStateOf(false) }
    
    ClutchPartnersTheme {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { 
                        Text(
                            "Warranty & Disputes",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold
                        )
                    },
                    actions = {
                        IconButton(onClick = { showCreateClaim = true }) {
                            Icon(Icons.Default.Add, contentDescription = "Create Claim")
                        }
                    }
                )
            },
            floatingActionButton = {
                FloatingActionButton(
                    onClick = { showCreateClaim = true },
                    containerColor = MaterialTheme.colorScheme.primary
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Create Claim")
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
                    listOf("Warranty Claims", "Disputes").forEachIndexed { index, title ->
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
                    0 -> WarrantyClaimsContent()
                    1 -> DisputesContent()
                }
            }
        }
    }
}

@Composable
fun WarrantyClaimsContent() {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(sampleWarrantyClaims) { claim ->
            WarrantyClaimCard(
                claim = claim,
                onClaimClick = { /* Handle claim click */ }
            )
        }
    }
}

@Composable
fun DisputesContent() {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(sampleDisputes) { dispute ->
            DisputeCard(
                dispute = dispute,
                onDisputeClick = { /* Handle dispute click */ }
            )
        }
    }
}

@Composable
fun WarrantyClaimCard(
    claim: WarrantyClaim,
    onClaimClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClaimClick() },
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
                        text = "Claim #${claim.id}",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    
                    Spacer(modifier = Modifier.height(4.dp))
                    
                    Text(
                        text = claim.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                
                WarrantyStatusChip(status = claim.status)
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Order: ${claim.orderId}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                Text(
                    text = formatWarrantyTime(claim.submittedAt),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            if (claim.resolution != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Resolution: ${claim.resolution}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

@Composable
fun DisputeCard(
    dispute: Dispute,
    onDisputeClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onDisputeClick() },
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
                        text = dispute.subject,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                    
                    Spacer(modifier = Modifier.height(4.dp))
                    
                    Text(
                        text = dispute.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                
                WarrantyStatusChip(status = dispute.status)
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Type: ${dispute.type}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                Text(
                    text = formatWarrantyTime(dispute.submittedAt),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            if (dispute.resolution != null) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Resolution: ${dispute.resolution}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

@Composable
fun WarrantyStatusChip(status: String) {
    val (backgroundColor, textColor) = when (status) {
        "Submitted" -> Color(0xFF4CAF50) to Color.White
        "Under Review" -> Color(0xFF2196F3) to Color.White
        "Approved" -> Color(0xFF4CAF50) to Color.White
        "Rejected" -> Color(0xFFF44336) to Color.White
        "Resolved" -> Color(0xFF9C27B0) to Color.White
        "Open" -> Color(0xFF4CAF50) to Color.White
        "Under Investigation" -> Color(0xFF2196F3) to Color.White
        "Escalated" -> Color(0xFFFF9800) to Color.White
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

data class WarrantyClaim(
    val id: String,
    val orderId: String,
    val type: String,
    val description: String,
    val status: String,
    val submittedAt: Date,
    val resolvedAt: Date? = null,
    val resolution: String? = null,
    val evidenceCount: Int = 0
)

data class Dispute(
    val id: String,
    val type: String,
    val subject: String,
    val description: String,
    val status: String,
    val submittedAt: Date,
    val resolvedAt: Date? = null,
    val resolution: String? = null,
    val relatedOrderId: String? = null
)

val sampleWarrantyClaims = listOf(
    WarrantyClaim(
        id = "WAR-001",
        orderId = "ORD-2024-001",
        type = "Product Defect",
        description = "Brake pads received were damaged during shipping. Need replacement.",
        status = "Approved",
        submittedAt = Date(System.currentTimeMillis() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        resolvedAt = Date(System.currentTimeMillis() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        resolution = "Replacement parts sent. Tracking: TRK-123456",
        evidenceCount = 3
    ),
    WarrantyClaim(
        id = "WAR-002",
        orderId = "ORD-2024-002",
        type = "Quality Issue",
        description = "Engine oil quality does not meet specifications. Customer complaint received.",
        status = "Under Review",
        submittedAt = Date(System.currentTimeMillis() - 5 * 60 * 1000), // 5 minutes ago
        evidenceCount = 2
    ),
    WarrantyClaim(
        id = "WAR-003",
        orderId = "ORD-2024-003",
        type = "Wrong Item",
        description = "Received wrong brake pads. Ordered for Honda Civic but received for Toyota Corolla.",
        status = "Rejected",
        submittedAt = Date(System.currentTimeMillis() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        resolvedAt = Date(System.currentTimeMillis() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        resolution = "Customer error in ordering. No replacement needed.",
        evidenceCount = 1
    )
)

val sampleDisputes = listOf(
    Dispute(
        id = "DIS-001",
        type = "Invoice Dispute",
        subject = "Incorrect Invoice Amount",
        description = "Invoice shows 500 EGP but order was only 350 EGP. Need correction.",
        status = "Resolved",
        submittedAt = Date(System.currentTimeMillis() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        resolvedAt = Date(System.currentTimeMillis() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        resolution = "Invoice corrected. Refund of 150 EGP processed.",
        relatedOrderId = "ORD-2024-004"
    ),
    Dispute(
        id = "DIS-002",
        type = "Payment Dispute",
        subject = "Payment Not Received",
        description = "Weekly payment was supposed to be processed but not received in account.",
        status = "Under Investigation",
        submittedAt = Date(System.currentTimeMillis() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        relatedOrderId = null
    ),
    Dispute(
        id = "DIS-003",
        type = "Service Dispute",
        subject = "Poor Service Quality",
        description = "Customer complained about poor service quality. Need to investigate.",
        status = "Open",
        submittedAt = Date(System.currentTimeMillis() - 4 * 60 * 60 * 1000), // 4 hours ago
        relatedOrderId = "ORD-2024-005"
    )
)

fun formatWarrantyTime(date: Date): String {
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
