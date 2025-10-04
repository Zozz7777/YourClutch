package com.clutch.partners.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.clutch.partners.data.model.InventoryItem
import com.clutch.partners.data.model.InventoryFilter
import com.clutch.partners.ui.components.*
import com.clutch.partners.ui.theme.PartnersBlue
import com.clutch.partners.ui.theme.Orange
import com.clutch.partners.viewmodel.InventoryManagementViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InventoryManagementScreen(
    viewModel: InventoryManagementViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.loadInventory()
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Inventory Management",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = PartnersBlue
            )
            
            IconButton(onClick = { viewModel.showAddItemDialog() }) {
                Icon(
                    Icons.Default.Add,
                    contentDescription = "Add Item",
                    tint = PartnersBlue
                )
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Stats Cards
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            StatsCard(
                title = "Total Items",
                value = uiState.totalItems.toString(),
                color = PartnersBlue,
                modifier = Modifier.weight(1f)
            )
            StatsCard(
                title = "Low Stock",
                value = uiState.lowStockItems.toString(),
                color = Orange,
                modifier = Modifier.weight(1f)
            )
            StatsCard(
                title = "Out of Stock",
                value = uiState.outOfStockItems.toString(),
                color = Color.Red,
                modifier = Modifier.weight(1f)
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Search and Filter
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = viewModel::setSearchQuery,
                label = { Text("Search items...") },
                modifier = Modifier.weight(1f),
                leadingIcon = {
                    Icon(Icons.Default.Search, contentDescription = "Search")
                }
            )
            
            IconButton(onClick = { viewModel.showFilterDialog() }) {
                Icon(
                    Icons.Default.FilterList,
                    contentDescription = "Filter",
                    tint = PartnersBlue
                )
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Inventory List
        if (uiState.isLoading) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = PartnersBlue)
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(uiState.filteredItems) { item ->
                    InventoryItemCard(
                        item = item,
                        onEdit = { viewModel.setEditingItem(item) },
                        onDelete = { viewModel.deleteInventoryItem(item.id) }
                    )
                }
            }
        }
    }
    
    // Add Item Dialog
    if (uiState.showingAddItemDialog) {
        AddInventoryItemDialog(
            onDismiss = { viewModel.hideAddItemDialog() },
            onAdd = { item -> viewModel.addInventoryItem(item) }
        )
    }
    
    // Filter Dialog
    if (uiState.showingFilterDialog) {
        FilterDialog(
            currentFilter = uiState.currentFilter,
            onFilterSelected = { filter ->
                viewModel.setFilter(filter)
                viewModel.hideFilterDialog()
            },
            onDismiss = { viewModel.hideFilterDialog() }
        )
    }
}

@Composable
fun StatsCard(
    title: String,
    value: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    PartnersCard(modifier = modifier) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = value,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = color
            )
            Text(
                text = title,
                fontSize = 12.sp,
                color = Color.Gray
            )
        }
    }
}

@Composable
fun InventoryItemCard(
    item: InventoryItem,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    PartnersCard {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = item.name,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "SKU: ${item.sku}",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                }
                
                Row {
                    IconButton(onClick = onEdit) {
                        Icon(
                            Icons.Default.Edit,
                            contentDescription = "Edit",
                            tint = PartnersBlue
                        )
                    }
                    IconButton(onClick = onDelete) {
                        Icon(
                            Icons.Default.Delete,
                            contentDescription = "Delete",
                            tint = Color.Red
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Price: $${String.format("%.2f", item.price)}",
                    fontSize = 14.sp
                )
                Text(
                    text = "Stock: ${item.stock}",
                    fontSize = 14.sp,
                    color = if (item.stock == 0) Color.Red else if (item.stock <= item.lowStockThreshold) Orange else Color.Green
                )
            }
        }
    }
}

@Composable
fun AddInventoryItemDialog(
    onDismiss: () -> Unit,
    onAdd: (InventoryItem) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var sku by remember { mutableStateOf("") }
    var price by remember { mutableStateOf("") }
    var stock by remember { mutableStateOf("") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Add Inventory Item") },
        text = {
            Column {
                PartnersTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = "Item Name",
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                PartnersTextField(
                    value = sku,
                    onValueChange = { sku = it },
                    label = "SKU",
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                PartnersTextField(
                    value = price,
                    onValueChange = { price = it },
                    label = "Price",
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                PartnersTextField(
                    value = stock,
                    onValueChange = { stock = it },
                    label = "Stock",
                    modifier = Modifier.fillMaxWidth()
                )
            }
        },
        confirmButton = {
            PartnersButton(
                onClick = {
                    if (name.isNotEmpty() && sku.isNotEmpty() && price.isNotEmpty() && stock.isNotEmpty()) {
                        val item = InventoryItem(
                            id = System.currentTimeMillis().toString(),
                            name = name,
                            sku = sku,
                            price = price.toDoubleOrNull() ?: 0.0,
                            stock = stock.toIntOrNull() ?: 0
                        )
                        onAdd(item)
                    }
                }
            ) {
                Text("Add")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
fun FilterDialog(
    currentFilter: InventoryFilter,
    onFilterSelected: (InventoryFilter) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Filter Items") },
        text = {
            Column {
                InventoryFilter.values().forEach { filter ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = currentFilter == filter,
                            onClick = { onFilterSelected(filter) }
                        )
                        Text(
                            text = filter.name.replace("_", " "),
                            modifier = Modifier.padding(start = 8.dp)
                        )
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Done")
            }
        }
    )
}