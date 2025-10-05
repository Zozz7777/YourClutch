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
                        // Revenue Card
                        item {
                            RevenueCard(
                                title = "Revenue",
                                today = data.revenue.today,
                                thisWeek = data.revenue.thisWeek,
                                thisMonth = data.revenue.thisMonth,
                                growthRate = data.revenue.growthRate
                            )
                        }
                        
                        // Orders Card
                        item {
                            OrdersCard(
                                total = data.orders.total,
                                pending = data.orders.pending,
                                completed = data.orders.completed,
                                cancelled = data.orders.cancelled
                            )
                        }
                        
                        // Inventory Card
                        item {
                            InventoryCard(
                                totalProducts = data.inventory.totalProducts,
                                lowStock = data.inventory.lowStock,
                                outOfStock = data.inventory.outOfStock,
                                totalValue = data.inventory.totalValue
                            )
                        }
                        
                        // Performance Card
                        item {
                            PerformanceCard(
                                averageOrderValue = data.performance.averageOrderValue,
                                customerSatisfaction = data.performance.customerSatisfaction,
                                completionRate = data.performance.completionRate,
                                responseTime = data.performance.responseTime
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun RevenueCard(
    title: String,
    today: Double,
    thisWeek: Double,
    thisMonth: Double,
    growthRate: Double
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                RevenueItem("Today", today)
                RevenueItem("This Week", thisWeek)
                RevenueItem("This Month", thisMonth)
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.TrendingUp,
                    contentDescription = null,
                    tint = Color(0xFF27AE60)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "+${growthRate}% growth",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF27AE60)
                )
            }
        }
    }
}

@Composable
fun RevenueItem(
    label: String,
    value: Double
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "$${String.format("%.0f", value)}",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
        )
    }
}

@Composable
fun OrdersCard(
    total: Int,
    pending: Int,
    completed: Int,
    cancelled: Int
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Orders",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                OrderStatItem("Total", total, MaterialTheme.colorScheme.primary)
                OrderStatItem("Pending", pending, Color(0xFFF39C12))
                OrderStatItem("Completed", completed, Color(0xFF27AE60))
                OrderStatItem("Cancelled", cancelled, MaterialTheme.colorScheme.error)
            }
        }
    }
}

@Composable
fun OrderStatItem(
    label: String,
    value: Int,
    color: Color
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = value.toString(),
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
        )
    }
}

@Composable
fun InventoryCard(
    totalProducts: Int,
    lowStock: Int,
    outOfStock: Int,
    totalValue: Double
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Inventory",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                InventoryStatItem("Total Products", totalProducts.toString(), MaterialTheme.colorScheme.primary)
                InventoryStatItem("Low Stock", lowStock.toString(), Color(0xFFF39C12))
                InventoryStatItem("Out of Stock", outOfStock.toString(), MaterialTheme.colorScheme.error)
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "Total Value: $${String.format("%.0f", totalValue)}",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }
}

@Composable
fun InventoryStatItem(
    label: String,
    value: String,
    color: Color
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
        )
    }
}

@Composable
fun PerformanceCard(
    averageOrderValue: Double,
    customerSatisfaction: Double,
    completionRate: Double,
    responseTime: Double
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = "Performance",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                PerformanceStatItem("Avg Order", "$${String.format("%.0f", averageOrderValue)}", MaterialTheme.colorScheme.primary)
                PerformanceStatItem("Satisfaction", "${String.format("%.1f", customerSatisfaction)}/5", Color(0xFF27AE60))
                PerformanceStatItem("Completion", "${String.format("%.1f", completionRate)}%", Color(0xFF27AE60))
                PerformanceStatItem("Response", "${String.format("%.1f", responseTime)}h", Color(0xFF3498DB))
            }
        }
    }
}

@Composable
fun PerformanceStatItem(
    label: String,
    value: String,
    color: Color
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = value,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
        )
    }
}
