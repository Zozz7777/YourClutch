package com.clutch.partners.ui.screens.advanced

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.clutch.partners.ui.components.StatCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SuppliersScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Suppliers") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { /* TODO: Add new supplier */ }
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Supplier")
            }
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primaryContainer)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = "Supplier Management",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Manage your supplier relationships",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }
            
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                    ) {
                        StatCard(
                            title = "Total Suppliers",
                            value = "15",
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                    ) {
                        StatCard(
                            title = "Active",
                            value = "12",
                            color = MaterialTheme.colorScheme.secondary
                        )
                    }
                }
            }
            
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                    ) {
                        StatCard(
                            title = "Top Rated",
                            value = "8",
                            color = MaterialTheme.colorScheme.tertiary
                        )
                    }
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                    ) {
                        StatCard(
                            title = "New This Month",
                            value = "3",
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
            
            item {
                Text(
                    "Supplier List",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold
                )
            }
            
            items(sampleSuppliers) { supplier ->
                SupplierCard(supplier = supplier)
            }
        }
    }
}

@Composable
fun SupplierCard(supplier: Supplier) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
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
                    text = supplier.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Rating: ${supplier.rating}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Contact: ${supplier.contact}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Status: ${supplier.status}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = "Category: ${supplier.category}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

data class Supplier(
    val id: String,
    val name: String,
    val contact: String,
    val rating: String,
    val status: String,
    val category: String
)

val sampleSuppliers = listOf(
    Supplier("1", "Tech Solutions Inc", "contact@techsolutions.com", "4.8", "Active", "Electronics"),
    Supplier("2", "Mobile Parts Co", "info@mobileparts.com", "4.6", "Active", "Parts"),
    Supplier("3", "Device Central", "sales@devicecentral.com", "4.9", "Active", "Electronics"),
    Supplier("4", "Repair Tools Ltd", "orders@repairtools.com", "4.4", "Active", "Tools"),
    Supplier("5", "Gadget World", "support@gadgetworld.com", "4.7", "Inactive", "Electronics")
)