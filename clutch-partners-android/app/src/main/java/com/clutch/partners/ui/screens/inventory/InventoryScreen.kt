package com.clutch.partners.ui.screens.inventory

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
import com.clutch.partners.viewmodel.InventoryViewModel
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InventoryScreen(
    navController: NavController,
    viewModel: InventoryViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedCategory by remember { mutableStateOf<String?>(null) }
    var selectedStatus by remember { mutableStateOf<String?>(null) }
    var searchQuery by remember { mutableStateOf("") }
    var showFilters by remember { mutableStateOf(false) }
    var viewMode by remember { mutableStateOf(ViewMode.LIST) }
    
    LaunchedEffect(selectedCategory, selectedStatus, searchQuery) {
        viewModel.loadInventory(
            category = selectedCategory,
            status = selectedStatus,
            search = if (searchQuery.isNotEmpty()) searchQuery else null
        )
    }
    
    ClutchPartnersTheme {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Top App Bar
            TopAppBar(
                title = { Text("Inventory") },
                actions = {
                    IconButton(onClick = { viewMode = if (viewMode == ViewMode.LIST) ViewMode.GRID else ViewMode.LIST }) {
                        Icon(
                            if (viewMode == ViewMode.LIST) Icons.Default.GridView else Icons.Default.List,
                            contentDescription = "Toggle View"
                        )
                    }
                    IconButton(onClick = { showFilters = !showFilters }) {
                        Icon(Icons.Default.FilterList, contentDescription = "Filters")
                    }
                    IconButton(onClick = { navController.navigate("add_inventory_item") }) {
                        Icon(Icons.Default.Add, contentDescription = "Add Item")
                    }
                }
            )
            
            // Search Bar
            SearchBar(
                query = searchQuery,
                onQueryChange = { searchQuery = it },
                onSearch = { /* Implement search */ }
            )
            
            // Quick Stats
            if (uiState.inventory.isNotEmpty()) {
                QuickStatsRow(
                    totalItems = uiState.inventory.size,
                    lowStockItems = uiState.inventory.count { it.isLowStock },
                    outOfStockItems = uiState.inventory.count { it.isOutOfStock }
                )
            }
            
            // Filters Section
            if (showFilters) {
                FiltersSection(
                    selectedCategory = selectedCategory,
                    selectedStatus = selectedStatus,
                    onCategoryChange = { selectedCategory = it },
                    onStatusChange = { selectedStatus = it },
                    onClearFilters = { 
                        selectedCategory = null
                        selectedStatus = null
                    }
                )
            }
            
            // Content
            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    LoadingIndicator(message = "Loading inventory...")
                }
            } else if (uiState.inventory.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    EmptyInventoryState(
                        onAddItem = { navController.navigate("add_inventory_item") }
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(uiState.inventory) { item ->
                        if (viewMode == ViewMode.LIST) {
                            InventoryItemCard(
                                item = item,
                                onClick = { navController.navigate("inventory_item/${item.id}") }
                            )
                        } else {
                            InventoryItemGridCard(
                                item = item,
                                onClick = { navController.navigate("inventory_item/${item.id}") }
                            )
                        }
                    }
                }
            }
            
            // Error handling
            uiState.error?.let { error ->
                ErrorHandler(
                    error = error,
                    onRetry = { 
                        viewModel.clearError()
                        viewModel.loadInventory(selectedCategory, selectedStatus, searchQuery)
                    },
                    onDismiss = { viewModel.clearError() }
                )
            }
        }
    }
}

enum class ViewMode {
    LIST, GRID
}

@Composable
fun SearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    onSearch: () -> Unit
) {
    OutlinedTextField(
        value = query,
        onValueChange = onQueryChange,
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        placeholder = { Text("Search inventory by name or SKU...") },
        leadingIcon = {
            Icon(Icons.Default.Search, contentDescription = "Search")
        },
        trailingIcon = {
            if (query.isNotEmpty()) {
                IconButton(onClick = { onQueryChange("") }) {
                    Icon(Icons.Default.Clear, contentDescription = "Clear")
                }
            }
        },
        singleLine = true,
        shape = RoundedCornerShape(12.dp)
    )
}

@Composable
fun QuickStatsRow(
    totalItems: Int,
    lowStockItems: Int,
    outOfStockItems: Int
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        StatCard(
            title = "Total Items",
            value = totalItems.toString(),
            icon = Icons.Default.Inventory,
            modifier = Modifier.weight(1f)
        )
        
        StatCard(
            title = "Low Stock",
            value = lowStockItems.toString(),
            icon = Icons.Default.Warning,
            iconTint = Color(0xFFFF9800),
            modifier = Modifier.weight(1f)
        )
        
        StatCard(
            title = "Out of Stock",
            value = outOfStockItems.toString(),
            icon = Icons.Default.Error,
            iconTint = Color(0xFFF44336),
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
fun FiltersSection(
    selectedCategory: String?,
    selectedStatus: String?,
    onCategoryChange: (String?) -> Unit,
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
                text = "Filters",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            // Category Filter
            Text(
                text = "Category:",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val categories = listOf("engine", "brakes", "electrical", "body", "interior")
                categories.forEach { category ->
                    FilterChip(
                        onClick = { onCategoryChange(if (selectedCategory == category) null else category) },
                        label = { Text(category.uppercase()) },
                        selected = selectedCategory == category
                    )
                }
            }
            
            // Status Filter
            Text(
                text = "Status:",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val statuses = listOf("active", "inactive", "discontinued")
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
fun InventoryItemGridCard(
    item: InventoryItem,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(200.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = item.name,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 2
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = "SKU: ${item.sku}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            Column {
                Text(
                    text = "Stock: ${item.stock}",
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Text(
                    text = "EGP ${item.price}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
                
                if (item.isLowStock || item.isOutOfStock) {
                    Spacer(modifier = Modifier.height(4.dp))
                    
                    StatusBadge(
                        text = if (item.isOutOfStock) "OUT OF STOCK" else "LOW STOCK",
                        color = if (item.isOutOfStock) Color(0xFFF44336) else Color(0xFFFF9800)
                    )
                }
            }
        }
    }
}
