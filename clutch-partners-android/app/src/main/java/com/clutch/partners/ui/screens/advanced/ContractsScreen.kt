package com.clutch.partners.ui.screens.advanced

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
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.clutch.partners.ClutchPartnersTheme
import com.clutch.partners.ui.components.StatCard
import com.clutch.partners.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ContractsScreen(
    navController: NavController,
    viewModel: MainViewModel = hiltViewModel()
) {
    ClutchPartnersTheme {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("Contracts") },
                    navigationIcon = {
                        IconButton(onClick = { navController.popBackStack() }) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                        }
                    },
                    actions = {
                        IconButton(onClick = { /* Add contract */ }) {
                            Icon(Icons.Default.Add, contentDescription = "Add Contract")
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
                                title = "Active",
                                value = "5",
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxWidth()
                        ) {
                            StatCard(
                                title = "Expiring",
                                value = "2",
                                color = MaterialTheme.colorScheme.error
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
                                title = "Total",
                                value = "8",
                                color = MaterialTheme.colorScheme.secondary
                            )
                        }
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxWidth()
                        ) {
                            StatCard(
                                title = "Draft",
                                value = "1",
                                color = MaterialTheme.colorScheme.tertiary
                            )
                        }
                    }
                }
                
                items(sampleContracts) { contract ->
                    ContractCard(contract = contract)
                }
            }
        }
    }
}

@Composable
fun ContractCard(contract: Contract) {
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
                    text = contract.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                ContractStatusChip(status = contract.status)
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = contract.partner,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Text(
                text = "Expires: ${contract.expiryDate}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun ContractStatusChip(status: String) {
    val (backgroundColor, textColor) = when (status) {
        "Active" -> MaterialTheme.colorScheme.primary to MaterialTheme.colorScheme.onPrimary
        "Expiring" -> MaterialTheme.colorScheme.error to MaterialTheme.colorScheme.onError
        "Draft" -> MaterialTheme.colorScheme.tertiary to MaterialTheme.colorScheme.onTertiary
        else -> MaterialTheme.colorScheme.surfaceVariant to MaterialTheme.colorScheme.onSurfaceVariant
    }
    
    Surface(
        modifier = Modifier,
        color = backgroundColor,
        shape = MaterialTheme.shapes.small
    ) {
        Text(
            text = status,
            style = MaterialTheme.typography.bodySmall,
            color = textColor,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}

data class Contract(
    val id: String,
    val title: String,
    val partner: String,
    val status: String,
    val expiryDate: String
)

val sampleContracts = listOf(
    Contract("1", "Service Agreement", "ABC Corp", "Active", "2024-12-31"),
    Contract("2", "Supply Contract", "XYZ Ltd", "Expiring", "2024-01-15"),
    Contract("3", "Maintenance Deal", "Tech Solutions", "Active", "2024-06-30"),
    Contract("4", "Partnership", "Global Inc", "Draft", "TBD"),
    Contract("5", "Support Contract", "Service Pro", "Active", "2024-03-20")
)
