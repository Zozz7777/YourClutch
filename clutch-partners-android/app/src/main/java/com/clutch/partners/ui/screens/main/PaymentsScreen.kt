package com.clutch.partners.ui.screens.main

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.clutch.partners.viewmodel.MainViewModel
import com.clutch.partners.ui.components.*
import com.clutch.partners.ui.components.Charts.*
import com.clutch.partners.ui.components.Cards.*
import com.clutch.partners.ui.components.Filters.*
import java.util.Date

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PaymentsScreen(
    navController: NavController,
    viewModel: MainViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var showFilters by remember { mutableStateOf(false) }
    var selectedPeriod by remember { mutableStateOf("WEEK") }
    var searchQuery by remember { mutableStateOf("") }
    
    LaunchedEffect(Unit) {
        viewModel.loadDashboardData()
    }
    
    ClutchPartnersTheme {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Top App Bar
            TopAppBar(
                title = { 
                    Text(
                        text = "Payments",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                },
                actions = {
                    IconButton(onClick = { showFilters = true }) {
                        Icon(Icons.Default.FilterList, contentDescription = "Filter")
                    }
                    IconButton(onClick = { /* Export */ }) {
                        Icon(Icons.Default.Download, contentDescription = "Export")
                    }
                }
            )
            
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Period Selector
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("WEEK", "MONTH", "YEAR").forEach { period ->
                            FilterChip(
                                label = period,
                                isSelected = selectedPeriod == period,
                                onClick = { selectedPeriod = period }
                            )
                        }
                    }
                }
                
                // Financial Overview Cards
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        StatCard(
                            title = "Total Revenue",
                            value = "EGP 25,420",
                            subtitle = "+12% vs last period",
                            icon = Icons.Default.AttachMoney,
                            iconTint = Color(0xFF4CAF50),
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            title = "Pending",
                            value = "EGP 2,150",
                            subtitle = "5 transactions",
                            icon = Icons.Default.Schedule,
                            iconTint = Color(0xFFFF9800),
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
                
                // Revenue Chart
                item {
                    RevenueChart(
                        data = listOf(
                            ChartDataPoint("Mon", 1200f),
                            ChartDataPoint("Tue", 1500f),
                            ChartDataPoint("Wed", 1800f),
                            ChartDataPoint("Thu", 2200f),
                            ChartDataPoint("Fri", 1900f),
                            ChartDataPoint("Sat", 1600f),
                            ChartDataPoint("Sun", 1400f)
                        ),
                        title = "Weekly Revenue Trend"
                    )
                }
                
                // Payment Method Distribution
                item {
                    PieChart(
                        data = listOf(
                            PieChartData("Cash", 0.4f, Color(0xFF4CAF50)),
                            PieChartData("Card", 0.35f, Color(0xFF2196F3)),
                            PieChartData("Bank Transfer", 0.15f, Color(0xFFFF9800)),
                            PieChartData("Digital Wallet", 0.1f, Color(0xFF9C27B0))
                        ),
                        title = "Payment Methods"
                    )
                }
                
                // Search Bar
                item {
                    SearchFilter(
                        query = searchQuery,
                        onQueryChange = { searchQuery = it },
                        placeholder = "Search transactions...",
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                
                // Transaction History Header
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Recent Transactions",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onBackground
                        )
                        TextButton(onClick = { /* View all */ }) {
                            Text("View All")
                        }
                    }
                }
                
                // Transaction List
                items(10) { index ->
                    PaymentCard(
                        transactionId = "TXN${1000 + index}",
                        amount = 500.0 + (index * 100),
                        status = if (index < 7) "COMPLETED" else "PENDING",
                        date = Date(System.currentTimeMillis() - (index * 24 * 60 * 60 * 1000)),
                        paymentMethod = listOf("Cash", "Card", "Bank Transfer", "Digital Wallet")[index % 4],
                        customerName = "Customer ${index + 1}",
                        onCardClick = { /* Navigate to transaction details */ }
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
    }
}

