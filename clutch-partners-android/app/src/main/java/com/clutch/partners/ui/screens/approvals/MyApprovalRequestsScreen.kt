package com.clutch.partners.ui.screens.approvals

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.clutch.partners.data.model.ApprovalRequest
import com.clutch.partners.ui.components.LoadingIndicator
import com.clutch.partners.viewmodel.ApprovalsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyApprovalRequestsScreen(
    navController: NavController,
    viewModel: ApprovalsViewModel
) {
    val uiState by viewModel.uiState.collectAsState()
    val currentLanguage by viewModel.currentLanguage.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadMyApprovalRequests()
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = if (currentLanguage == "ar") "طلباتي" else "My Requests",
                        color = MaterialTheme.colorScheme.onSurface
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = if (currentLanguage == "ar") "رجوع" else "Back"
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
        ) {
            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    LoadingIndicator()
                }
            } else if (uiState.myApprovalRequests.isEmpty()) {
                EmptyMyRequestsState()
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(uiState.myApprovalRequests) { approval ->
                        MyApprovalRequestCard(
                            approval = approval,
                            currentLanguage = currentLanguage
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun EmptyMyRequestsState() {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.PersonAdd,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.primary
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "No approval requests",
            style = MaterialTheme.typography.headlineSmall,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "You haven't submitted any team member requests yet",
            style = MaterialTheme.typography.bodyMedium,
            textAlign = TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
fun MyApprovalRequestCard(
    approval: ApprovalRequest,
    currentLanguage: String
) {
    val statusColor = when (approval.status) {
        "pending" -> MaterialTheme.colorScheme.primary
        "approved" -> Color(0xFF4CAF50)
        "rejected" -> MaterialTheme.colorScheme.error
        "expired" -> MaterialTheme.colorScheme.onSurfaceVariant
        else -> MaterialTheme.colorScheme.onSurfaceVariant
    }

    val statusIcon = when (approval.status) {
        "pending" -> Icons.Default.Schedule
        "approved" -> Icons.Default.CheckCircle
        "rejected" -> Icons.Default.Cancel
        "expired" -> Icons.Default.Schedule
        else -> Icons.Default.Info
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = if (currentLanguage == "ar") "طلب انضمام للفريق" else "Team Join Request",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = approval.requesterEmail,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = statusIcon,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = statusColor
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = when (approval.status) {
                            "pending" -> if (currentLanguage == "ar") "معلق" else "Pending"
                            "approved" -> if (currentLanguage == "ar") "موافق عليه" else "Approved"
                            "rejected" -> if (currentLanguage == "ar") "مرفوض" else "Rejected"
                            "expired" -> if (currentLanguage == "ar") "منتهي الصلاحية" else "Expired"
                            else -> approval.status
                        },
                        style = MaterialTheme.typography.labelMedium,
                        color = statusColor,
                    modifier = Modifier
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = if (currentLanguage == "ar") "الدور المطلوب:" else "Requested Role:",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = approval.requestedRole.replace("_", " ").uppercase(),
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.Medium
                    )
                }
                Text(
                    text = if (currentLanguage == "ar") "منذ ${approval.daysSinceRequest} أيام" else "${approval.daysSinceRequest} days ago",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            if (approval.businessJustification.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = if (currentLanguage == "ar") "التبرير:" else "Justification:",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = approval.businessJustification,
                    style = MaterialTheme.typography.bodyMedium
                )
            }

            if (approval.status == "rejected" && !approval.rejectionReason.isNullOrEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = if (currentLanguage == "ar") "سبب الرفض:" else "Rejection Reason:",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.error
                )
                Text(
                    text = approval.rejectionReason ?: "",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.error
                )
            }

            if (approval.status == "approved") {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = if (currentLanguage == "ar") "تمت الموافقة على طلبك! يمكنك الآن تسجيل الدخول." else "Your request has been approved! You can now sign in.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF4CAF50),
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}
