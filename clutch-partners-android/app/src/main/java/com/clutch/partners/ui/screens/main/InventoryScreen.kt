package com.clutch.partners.ui.screens.main

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
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
import com.clutch.partners.viewmodel.InventoryViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InventoryScreen(
    navController: NavController,
    viewModel: InventoryViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showFilters by remember { mutableStateOf(false) }
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("ALL") }
    var viewMode by remember { mutableStateOf(InventoryViewMode.LIST) }
    var showBarcodeScanner by remember { mutableStateOf(false) }
    
    LaunchedEffect(Unit) {
        viewModel.loadInventory()
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
                    text = "Inventory",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
            },
            actions = {
                IconButton(onClick = { showBarcodeScanner = true }) {
                    Icon(
                        imageVector = Icons.Default.QrCodeScanner,
                        contentDescription = "Scan Barcode"
                    )
                }
                IconButton(onClick = { showFilters = true }) {
                    Icon(
                        imageVector = Icons.Default.FilterList,
                        contentDescription = "Filter"
                    )
                }
                IconButton(onClick = { /* TODO: Navigate to add item */ }) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Add Item"
                    )
                }
            }
        )
        
        // Search Bar
        SearchFilter(
            query = searchQuery,
            onQueryChange = { 
                searchQuery = it
                viewModel.searchInventory(it)
            },
            placeholder = "Search inventory...",
            modifier = Modifier.padding(16.dp)
        )
        
        // View Mode Toggle and Category Filter
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // View Mode Toggle
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FilterChip(
                    label = "List",
                    isSelected = viewMode == InventoryViewMode.LIST,
                    onClick = { viewMode = InventoryViewMode.LIST }
                )
                FilterChip(
                    label = "Grid",
                    isSelected = viewMode == InventoryViewMode.GRID,
                    onClick = { viewMode = InventoryViewMode.GRID }
                )
            }
            
            // Category Filter
            FilterChip(
                label = selectedCategory,
                isSelected = true,
                onClick = { /* TODO: Show category picker */ }
            )
        }
        
        // Quick Stats
        if (uiState.inventory.isNotEmpty()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                StatCard(
                    title = "Total Items",
                    value = uiState.inventory.size.toString(),
                    icon = Icons.Default.Inventory,
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Low Stock",
                    value = uiState.inventory.count { it.isLowStock }.toString(),
                    icon = Icons.Default.Warning,
                    iconTint = Color(0xFFFF9800),
                    modifier = Modifier.weight(1f)
                )
                StatCard(
                    title = "Out of Stock",
                    value = uiState.inventory.count { it.isOutOfStock }.toString(),
                    icon = Icons.Default.Error,
                    iconTint = Color(0xFFF44336),
                    modifier = Modifier.weight(1f)
                )
            }
        }
        
        // Inventory Content
        when (viewMode) {
            InventoryViewMode.LIST -> {
                InventoryListView(
                    inventory = uiState.inventory,
                    isLoading = uiState.isLoading,
                    onItemClick = { itemId ->
                        navController.navigate("inventory_item/$itemId")
                    },
                    onEdit = { itemId ->
                        // TODO: Navigate to edit item
                    },
                    onRestock = { itemId ->
                        // TODO: Navigate to restock item
                    },
                    onDelete = { itemId ->
                        viewModel.deleteInventoryItem(itemId)
                    }
                )
            }
            InventoryViewMode.GRID -> {
                InventoryGridView(
                    inventory = uiState.inventory,
                    isLoading = uiState.isLoading,
                    onItemClick = { itemId ->
                        navController.navigate("inventory_item/$itemId")
                    },
                    onEdit = { itemId ->
                        // TODO: Navigate to edit item
                    },
                    onRestock = { itemId ->
                        // TODO: Navigate to restock item
                    },
                    onDelete = { itemId ->
                        viewModel.deleteInventoryItem(itemId)
                    }
                )
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
    
    // Barcode Scanner Dialog
    if (showBarcodeScanner) {
        AlertDialog(
            onDismissRequest = { showBarcodeScanner = false },
            title = { Text("Scan Barcode") },
            text = { Text("Barcode scanner functionality will be implemented here") },
            confirmButton = {
                TextButton(onClick = { showBarcodeScanner = false }) {
                    Text("OK")
                }
            }
        )
    }
}

@Composable
fun InventoryListView(
    inventory: List<com.clutch.partners.data.model.InventoryItem>,
    isLoading: Boolean,
    onItemClick: (String) -> Unit,
    onEdit: (String) -> Unit,
    onRestock: (String) -> Unit,
    onDelete: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        if (isLoading) {
            items(5) {
                SkeletonCard()
            }
        } else if (inventory.isEmpty()) {
            item {
                EmptyState(
                    icon = Icons.Default.Inventory,
                    title = "No Inventory Items",
                    description = "You haven't added any inventory items yet",
                    actionText = "Add Item",
                    onActionClick = { /* TODO: Navigate to add item */ }
                )
            }
        } else {
            items(inventory) { item ->
                SwipeableInventoryItemCard(
                    item = item,
                    onItemClick = { onItemClick(item.id) },
                    onEdit = { onEdit(item.id) },
                    onRestock = { onRestock(item.id) },
                    onDelete = { onDelete(item.id) }
                )
            }
        }
    }
}

@Composable
fun InventoryGridView(
    inventory: List<com.clutch.partners.data.model.InventoryItem>,
    isLoading: Boolean,
    onItemClick: (String) -> Unit,
    onEdit: (String) -> Unit,
    onRestock: (String) -> Unit,
    onDelete: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        if (isLoading) {
            items(6) {
                SkeletonCard()
            }
        } else if (inventory.isEmpty()) {
            item(span = { GridItemSpan(2) }) {
                EmptyState(
                    icon = Icons.Default.Inventory,
                    title = "No Inventory Items",
                    description = "You haven't added any inventory items yet",
                    actionText = "Add Item",
                    onActionClick = { /* TODO: Navigate to add item */ }
                )
            }
        } else {
            items(inventory) { item ->
                SwipeableInventoryItemCard(
                    item = item,
                    onItemClick = { onItemClick(item.id) },
                    onEdit = { onEdit(item.id) },
                    onRestock = { onRestock(item.id) },
                    onDelete = { onDelete(item.id) }
                )
            }
        }
    }
}

@Composable
fun SwipeableInventoryItemCard(
    item: com.clutch.partners.data.model.InventoryItem,
    onItemClick: (String) -> Unit,
    onEdit: (String) -> Unit,
    onRestock: (String) -> Unit,
    onDelete: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    // For now, we'll use a simple card without swipe functionality
    // In a real implementation, you would use a swipe-to-reveal library
    Card(
        onClick = { onItemClick(item.id) },
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        InventoryItemCard(
            itemId = item.id,
            name = item.name,
            sku = item.sku,
            price = item.price,
            stock = item.stock,
            minStock = item.minStock,
            category = item.category,
            isLowStock = item.isLowStock,
            isOutOfStock = item.isOutOfStock,
            onCardClick = { onItemClick(item.id) },
            modifier = Modifier.fillMaxWidth()
        )
    }
}

enum class InventoryViewMode {
    LIST,
    GRID
}
