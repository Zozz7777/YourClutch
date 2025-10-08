package com.clutch.partners.ui.screens.main

import androidx.compose.foundation.background
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
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.clutch.partners.navigation.Screen
import com.clutch.partners.ui.components.*
import com.clutch.partners.ui.components.Cards.*
import com.clutch.partners.ui.components.Filters.*
import com.clutch.partners.ui.components.Actions.*
import com.clutch.partners.viewmodel.QuotationsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuotationsScreen(
    navController: NavController,
    viewModel: QuotationsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showFilters by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }
    var selectedStatus by remember { mutableStateOf("ALL") }
    
    LaunchedEffect(Unit) {
        viewModel.loadQuotations()
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Top App Bar
        TopAppBar(
            title = { 
                Text(
                    text = "Quotations",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            },
            actions = {
                IconButton(onClick = { showFilters = true }) {
                    Icon(
                        imageVector = Icons.Default.FilterList,
                        contentDescription = "Filter"
                    )
                }
                IconButton(onClick = { /* TODO: Navigate to create quotation */ }) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Create Quotation"
                    )
                }
            }
        )
        
        // Search Bar
        SearchFilter(
            query = searchQuery,
            onQueryChange = { 
                searchQuery = it
                viewModel.searchQuotations(it)
            },
            placeholder = "Search quotations...",
            modifier = Modifier.padding(16.dp)
        )
        
        // Status Filter Chips
        val statusOptions = listOf("ALL", "PENDING", "SENT", "ACCEPTED", "REJECTED", "EXPIRED")
        LazyRow(
            modifier = Modifier.padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(statusOptions) { status ->
                FilterChip(
                    label = status,
                    isSelected = selectedStatus == status,
                    onClick = { 
                        selectedStatus = status
                        viewModel.filterByStatus(status)
                    }
                )
            }
        }
        
        // Quick Stats
        if (uiState.quotations.isNotEmpty()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                StatCard(
                    title = "Total",
                    value = uiState.quotations.size.toString(),
                    icon = Icons.Default.Description,
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Pending",
                    value = uiState.quotations.count { it.status.name == "PENDING" }.toString(),
                    icon = Icons.Default.Schedule,
                    iconTint = Color(0xFFFF9800),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Accepted",
                    value = uiState.quotations.count { it.status.name == "ACCEPTED" }.toString(),
                    icon = Icons.Default.CheckCircle,
                    iconTint = Color(0xFF4CAF50),
                    modifier = Modifier.weight(1f)
                )
            }
        }
        
        // Quotations List
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (uiState.isLoading) {
                items(5) {
                    SkeletonCard()
                }
            } else if (uiState.quotations.isEmpty()) {
                item {
                    EmptyState(
                        icon = Icons.Default.Description,
                        title = "No Quotations Found",
                        description = if (searchQuery.isNotEmpty()) 
                            "No quotations match your search criteria" 
                        else 
                            "You haven't created any quotations yet",
                        actionText = if (searchQuery.isEmpty()) "Create Quotation" else null,
                        onActionClick = { /* TODO: Navigate to create quotation */ }
                    )
                }
            } else {
                items(uiState.quotations) { quotation ->
                    SwipeableQuotationCard(
                        quotation = quotation,
                        onQuotationClick = { quotationId ->
                            navController.navigate("quotation_details/$quotationId")
                        },
                        onEdit = { quotationId ->
                            // TODO: Navigate to edit quotation
                        },
                        onSend = { quotationId ->
                            viewModel.sendQuotation(quotationId)
                        },
                        onDelete = { quotationId ->
                            viewModel.deleteQuotation(quotationId)
                        }
                    )
                }
            }
        }
    }
    
    // Filter Bottom Sheet
    FilterBottomSheet(
        isVisible = showFilters,
        onDismiss = { showFilters = false },
        onApplyFilters = { 
            // TODO: Apply filters
            showFilters = false 
        },
        onClearFilters = { 
            // TODO: Clear filters
        }
    ) {
        // Filter content would go here
        Text("Filter options will be implemented here")
    }
}

@Composable
fun SwipeableQuotationCard(
    quotation: com.clutch.partners.data.model.Quotation,
    onQuotationClick: (String) -> Unit,
    onEdit: (String) -> Unit,
    onSend: (String) -> Unit,
    onDelete: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    // For now, we'll use a simple card without swipe functionality
    // In a real implementation, you would use a swipe-to-reveal library
    Card(
        onClick = { onQuotationClick(quotation.id) },
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        QuotationCard(
            quotationId = quotation.quotationId,
            customerName = quotation.customer.name,
            totalAmount = quotation.total,
            status = quotation.status.name,
            validUntil = quotation.validUntil,
            itemCount = quotation.items.size,
            onCardClick = { onQuotationClick(quotation.id) },
            modifier = Modifier.fillMaxWidth()
        )
    }
}
