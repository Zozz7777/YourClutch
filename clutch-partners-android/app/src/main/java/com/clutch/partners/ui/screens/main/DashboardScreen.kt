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
import com.clutch.partners.data.model.DashboardData
import com.clutch.partners.viewmodel.MainViewModel
import com.clutch.partners.ui.components.*
import com.clutch.partners.ui.components.Charts.*
import com.clutch.partners.ui.components.Cards.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    navController: NavController,
    viewModel: MainViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
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
                title = { Text("Dashboard") },
                actions = {
                    IconButton(onClick = { /* Refresh */ }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                    }
                }
            )
            
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                if (uiState.isLoading) {
                    item {
                        Box(
                            modifier = Modifier.fillMaxWidth(),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator()
                        }
                    }
                } else {
                    uiState.dashboardData?.let { data ->
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
                        
                        // Orders Chart
                        item {
                            OrdersChart(
                                data = listOf(
                                    ChartDataPoint("Jan", 45f),
                                    ChartDataPoint("Feb", 52f),
                                    ChartDataPoint("Mar", 48f),
                                    ChartDataPoint("Apr", 61f),
                                    ChartDataPoint("May", 55f),
                                    ChartDataPoint("Jun", 67f)
                                ),
                                title = "Monthly Orders"
                            )
                        }
                        
                        // Performance Metrics
                        item {
                            PerformanceChart(
                                metrics = listOf(
                                    PerformanceMetric("Completion Rate", "94.5%", 0.945f, Color(0xFF4CAF50)),
                                    PerformanceMetric("Customer Satisfaction", "4.7/5", 0.94f, Color(0xFF2196F3)),
                                    PerformanceMetric("Response Time", "2.3h", 0.85f, Color(0xFFFF9800)),
                                    PerformanceMetric("Order Accuracy", "98.2%", 0.982f, Color(0xFF9C27B0))
                                ),
                                title = "Performance Metrics"
                            )
                        }
                        
                        // Revenue Distribution Pie Chart
                        item {
                            PieChart(
                                data = listOf(
                                    PieChartData("Service", 0.4f, Color(0xFF4CAF50)),
                                    PieChartData("Parts", 0.35f, Color(0xFF2196F3)),
                                    PieChartData("Accessories", 0.15f, Color(0xFFFF9800)),
                                    PieChartData("Other", 0.1f, Color(0xFF9C27B0))
                                ),
                                title = "Revenue by Category"
                            )
                        }
                        
                        // Quick Stats Row
                        item {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                StatCard(
                                    title = "Today's Revenue",
                                    value = "EGP ${String.format("%.0f", data.revenue.today)}",
                                    icon = Icons.Default.AttachMoney,
                                    iconTint = Color(0xFF4CAF50),
                                    modifier = Modifier.weight(1f)
                                )
                                StatCard(
                                    title = "Active Orders",
                                    value = data.orders.pending.toString(),
                                    icon = Icons.Default.ShoppingCart,
                                    iconTint = Color(0xFFFF9800),
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }
                        
                        // Inventory Alerts
                        if (data.inventory.lowStock > 0 || data.inventory.outOfStock > 0) {
                            item {
                                InventoryAlertsCard(
                                    lowStock = data.inventory.lowStock,
                                    outOfStock = data.inventory.outOfStock
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun InventoryAlertsCard(
    lowStock: Int,
    outOfStock: Int
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (outOfStock > 0) Color(0xFFFFEBEE) else Color(0xFFFFF3E0)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = if (outOfStock > 0) Icons.Default.Error else Icons.Default.Warning,
                    contentDescription = null,
                    tint = if (outOfStock > 0) Color(0xFFF44336) else Color(0xFFFF9800)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Inventory Alerts",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = if (outOfStock > 0) Color(0xFFF44336) else Color(0xFFFF9800)
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            if (outOfStock > 0) {
                Text(
                    text = "$outOfStock items are out of stock",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFFF44336)
                )
            }
            
            if (lowStock > 0) {
                Text(
                    text = "$lowStock items are running low",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFFFF9800)
                )
            }
        }
    }
}
