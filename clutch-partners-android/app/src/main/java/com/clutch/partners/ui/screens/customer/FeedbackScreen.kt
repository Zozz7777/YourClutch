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
fun FeedbackScreen(navController: NavController) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Customer Feedback") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
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
                            text = "Customer Feedback",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Monitor customer satisfaction and feedback",
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
                            title = "Average Rating",
                            value = "4.7",
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                    ) {
                        StatCard(
                            title = "Total Reviews",
                            value = "156",
                            color = MaterialTheme.colorScheme.secondary
                        )
                    }
                }
            }
            
            item {
                Text(
                    "Recent Feedback",
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.SemiBold
                )
            }
            
            items(sampleFeedback) { feedback ->
                FeedbackCard(feedback = feedback)
            }
        }
    }
}

@Composable
fun FeedbackCard(feedback: CustomerFeedback) {
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
                    text = feedback.customerName,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "★ ${feedback.rating}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = feedback.comment,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = feedback.date,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }
}

data class CustomerFeedback(
    val id: String,
    val customerName: String,
    val rating: String,
    val comment: String,
    val date: String
)

val sampleFeedback = listOf(
    CustomerFeedback("1", "John Smith", "5.0", "Excellent service! My phone was repaired quickly and professionally.", "2024-01-15"),
    CustomerFeedback("2", "Sarah Johnson", "4.5", "Good service, but had to wait a bit longer than expected.", "2024-01-14"),
    CustomerFeedback("3", "Mike Davis", "5.0", "Outstanding work! Highly recommend this repair center.", "2024-01-13"),
    CustomerFeedback("4", "Lisa Wilson", "4.0", "Satisfied with the repair, staff was friendly and helpful.", "2024-01-12"),
    CustomerFeedback("5", "David Brown", "4.8", "Great experience overall, will definitely come back.", "2024-01-11")
)