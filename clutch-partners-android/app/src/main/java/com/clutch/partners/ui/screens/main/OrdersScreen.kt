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
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.clutch.partners.navigation.Screen
import com.clutch.partners.ui.components.*
import com.clutch.partners.ui.components.Cards.*
import com.clutch.partners.ui.components.Filters.*
import com.clutch.partners.ui.components.Actions.*
import com.clutch.partners.viewmodel.OrdersViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersScreen(
    navController: NavController,
    viewModel: OrdersViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showFilters by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }
    
    LaunchedEffect(Unit) {
        viewModel.loadOrders()
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
                    text = "Orders",
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
                IconButton(onClick = { /* TODO: Navigate to create order */ }) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Add Order"
                    )
                }
            }
        )
        
        // Search Bar
        SearchFilter(
            query = searchQuery,
            onQueryChange = { 
                searchQuery = it
                viewModel.searchOrders(it)
            },
            placeholder = "Search orders...",
            modifier = Modifier.padding(16.dp)
        )
        
        // Quick Stats
        if (uiState.orders.isNotEmpty()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                StatCard(
                    title = "Total Orders",
                    value = uiState.orders.size.toString(),
                    icon = Icons.Default.ShoppingCart,
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Pending",
                    value = uiState.orders.count { it.status.name == "PENDING" }.toString(),
                    icon = Icons.Default.Schedule,
                    iconTint = androidx.compose.ui.graphics.Color(0xFFFF9800),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Completed",
                    value = uiState.orders.count { it.status.name == "COMPLETED" }.toString(),
                    icon = Icons.Default.CheckCircle,
                    iconTint = androidx.compose.ui.graphics.Color(0xFF4CAF50),
                    modifier = Modifier.weight(1f)
                )
            }
        }
        
        // Orders List
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            if (uiState.isLoading) {
                items(5) {
                    SkeletonCard()
                }
            } else if (uiState.orders.isEmpty()) {
                item {
                    EmptyState(
                        icon = Icons.Default.ShoppingCart,
                        title = "No Orders Found",
                        description = if (searchQuery.isNotEmpty()) 
                            "No orders match your search criteria" 
                        else 
                            "You haven't received any orders yet",
                        actionText = if (searchQuery.isEmpty()) "Create Order" else null,
                        onActionClick = { /* TODO: Navigate to create order */ }
                    )
                }
            } else {
                items(uiState.orders) { order ->
                    SwipeableOrderCard(
                        order = order,
                        onOrderClick = { orderId ->
                            navController.navigate("order_details/$orderId")
                        },
                        onEdit = { orderId ->
                            // TODO: Navigate to edit order
                        },
                        onComplete = { orderId ->
                            viewModel.updateOrderStatus(orderId, "COMPLETED")
                        },
                        onCancel = { orderId ->
                            viewModel.updateOrderStatus(orderId, "CANCELLED")
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
fun SwipeableOrderCard(
    order: com.clutch.partners.data.model.Order,
    onOrderClick: (String) -> Unit,
    onEdit: (String) -> Unit,
    onComplete: (String) -> Unit,
    onCancel: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    // For now, we'll use a simple card without swipe functionality
    // In a real implementation, you would use a swipe-to-reveal library
    Card(
        onClick = { onOrderClick(order.id) },
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        OrderCard(
            orderId = order.id,
            customerName = order.customerName,
            totalAmount = order.totalAmount,
            status = order.status.name,
            date = order.createdAt,
            itemCount = order.items.size,
            onCardClick = { onOrderClick(order.id) },
            modifier = Modifier.fillMaxWidth()
        )
    }
}
