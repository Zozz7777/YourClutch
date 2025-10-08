package com.clutch.partners.ui.screens.quotations

import androidx.compose.foundation.background
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.clutch.partners.ClutchPartnersTheme
import com.clutch.partners.data.model.*
import com.clutch.partners.ui.components.*
import com.clutch.partners.viewmodel.QuotationsViewModel
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuotationsScreen(
    navController: NavController,
    viewModel: QuotationsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedStatus by remember { mutableStateOf<String?>(null) }
    var showFilters by remember { mutableStateOf(false) }
    
    LaunchedEffect(selectedStatus) {
        viewModel.loadQuotations(selectedStatus)
    }
    
    ClutchPartnersTheme {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Top App Bar
            TopAppBar(
                title = { Text("Quotations") },
                actions = {
                    IconButton(onClick = { showFilters = !showFilters }) {
                        Icon(Icons.Default.FilterList, contentDescription = "Filters")
                    }
                    IconButton(onClick = { navController.navigate("create_quotation") }) {
                        Icon(Icons.Default.Add, contentDescription = "Create Quotation")
                    }
                }
            )
            
            // Filters Section
            if (showFilters) {
                FiltersSection(
                    selectedStatus = selectedStatus,
                    onStatusChange = { selectedStatus = it },
                    onClearFilters = { selectedStatus = null }
                )
            }
            
            // Content
            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    LoadingIndicator(message = "Loading quotations...")
                }
            } else if (uiState.quotations.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    EmptyQuotationsState(
                        onCreateQuotation = { navController.navigate("create_quotation") }
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(uiState.quotations) { quotation ->
                        QuotationCard(
                            quotation = quotation,
                            onClick = { navController.navigate("quotation_details/${quotation.id}") }
                        )
                    }
                }
            }
            
            // Error handling
            uiState.error?.let { error ->
                ErrorHandler(
                    error = error,
                    onRetry = { 
                        viewModel.clearError()
                        viewModel.loadQuotations(selectedStatus)
                    },
                    onDismiss = { viewModel.clearError() }
                )
            }
        }
    }
}

@Composable
fun FiltersSection(
    selectedStatus: String?,
    onStatusChange: (String?) -> Unit,
    onClearFilters: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Filter by Status",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            // Status Filter Chips
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val statuses = listOf("pending", "accepted", "rejected", "expired")
                statuses.forEach { status ->
                    FilterChip(
                        onClick = { onStatusChange(if (selectedStatus == status) null else status) },
                        label = { Text(status.uppercase()) },
                        selected = selectedStatus == status
                    )
                }
            }
            
            // Clear Filters
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                TextButton(onClick = onClearFilters) {
                    Text("Clear All")
                }
            }
        }
    }
}

@Composable
fun QuotationCard(
    quotation: Quotation,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
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
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Quote #${quotation.quotationId}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Text(
                    text = "EGP ${quotation.total}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = quotation.customer.name,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = quotation.service,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    StatusBadge(
                        text = quotation.status.name,
                        color = when (quotation.status) {
                            QuotationStatus.PENDING -> Color(0xFFFF9800)
                            QuotationStatus.ACCEPTED -> Color(0xFF4CAF50)
                            QuotationStatus.REJECTED -> Color(0xFFF44336)
                            QuotationStatus.EXPIRED -> Color(0xFF9E9E9E)
                            else -> MaterialTheme.colorScheme.outline
                        }
                    )
                    
                    if (quotation.isExpired) {
                        StatusBadge(
                            text = "EXPIRED",
                            color = Color(0xFF9E9E9E)
                        )
                    }
                }
                
                Text(
                    text = quotation.createdAt.format(DateTimeFormatter.ofPattern("MMM d, HH:mm")),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            // Items count
            if (quotation.items.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = "${quotation.items.size} items",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            // Valid until
            quotation.validUntil?.let { validUntil ->
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = "Valid until: ${validUntil.format(DateTimeFormatter.ofPattern("MMM d, yyyy"))}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
