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
fun POSScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Point of Sale") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { /* TODO: Start new sale */ }
            ) {
                Icon(Icons.Default.Add, contentDescription = "New Sale")
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
                            text = "POS Dashboard",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Manage sales and transactions",
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
                            title = "Today's Sales",
                            value = "$2,450",
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                    ) {
                        StatCard(
                            title = "Transactions",
                            value = "23",
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
                            title = "Average Sale",
                            value = "$106.52",
                            color = MaterialTheme.colorScheme.tertiary
                        )
                    }
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                    ) {
                        StatCard(
                            title = "Top Product",
                            value = "iPhone 15",
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            }
            
            item {
                Text(
                    "Recent Transactions",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold
                )
            }
            
            items(sampleTransactions) { transaction ->
                TransactionCard(transaction = transaction)
            }
        }
    }
}

@Composable
fun TransactionCard(transaction: Transaction) {
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
                    text = "Transaction #${transaction.id}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "$${transaction.amount}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Customer: ${transaction.customer}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = "Time: ${transaction.time}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

data class Transaction(
    val id: String,
    val customer: String,
    val amount: Double,
    val time: String
)

val sampleTransactions = listOf(
    Transaction("001", "John Doe", 299.99, "2:30 PM"),
    Transaction("002", "Jane Smith", 149.99, "2:15 PM"),
    Transaction("003", "Mike Johnson", 89.99, "1:45 PM"),
    Transaction("004", "Sarah Wilson", 199.99, "1:30 PM"),
    Transaction("005", "David Brown", 79.99, "1:15 PM")
)