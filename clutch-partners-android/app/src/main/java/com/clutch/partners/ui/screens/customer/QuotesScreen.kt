package com.clutch.partners.ui.screens.customer

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
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
fun QuotesScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Service Quotes") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { /* TODO: Create new quote */ }
            ) {
                Icon(Icons.Default.Add, contentDescription = "New Quote")
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
                            text = "Quote Management",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Create and manage service quotes for customers",
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
                            title = "Pending Quotes",
                            value = "8",
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                    ) {
                        StatCard(
                            title = "Accepted",
                            value = "12",
                            color = MaterialTheme.colorScheme.secondary
                        )
                    }
                }
            }
            
            item {
                Text(
                    "Recent Quotes",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold
                )
            }
            
            items(sampleQuotes) { quote ->
                QuoteCard(quote = quote)
            }
        }
    }
}

@Composable
fun QuoteCard(quote: ServiceQuote) {
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
                    text = "Quote #${quote.id}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "$${quote.amount}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Customer: ${quote.customerName}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = "Service: ${quote.service}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Status: ${quote.status}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = quote.date,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

data class ServiceQuote(
    val id: String,
    val customerName: String,
    val service: String,
    val amount: Double,
    val status: String,
    val date: String
)

val sampleQuotes = listOf(
    ServiceQuote("Q001", "John Smith", "iPhone Screen Repair", 150.00, "Pending", "2024-01-15"),
    ServiceQuote("Q002", "Sarah Johnson", "Battery Replacement", 89.99, "Accepted", "2024-01-14"),
    ServiceQuote("Q003", "Mike Davis", "Water Damage Repair", 299.99, "Pending", "2024-01-13"),
    ServiceQuote("Q004", "Lisa Wilson", "Software Update", 49.99, "Accepted", "2024-01-12"),
    ServiceQuote("Q005", "David Brown", "Screen Replacement", 199.99, "Rejected", "2024-01-11")
)