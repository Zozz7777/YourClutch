package com.clutch.partners

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ClutchPartnersTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainScreen()
                }
            }
        }
    }
}

@Composable
fun MainScreen() {
    var selectedTab by remember { mutableStateOf(0) }
    
    val tabs = listOf("Home", "Orders", "Inventory", "Payments", "Settings")
    
    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        // Header
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Clutch Partners",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Automotive Business Management",
                    fontSize = 16.sp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        
        // Tab Row
        TabRow(selectedTabIndex = selectedTab) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { Text(title) }
                )
            }
        }
        
        // Content
        when (selectedTab) {
            0 -> HomeContent()
            1 -> OrdersContent()
            2 -> InventoryContent()
            3 -> PaymentsContent()
            4 -> SettingsContent()
        }
    }
}

@Composable
fun HomeContent() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Text(
                text = "Dashboard",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
        }
        
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Today's Orders",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("5 new orders")
                    Text("3 pending orders")
                    Text("2 completed orders")
                }
            }
        }
        
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Revenue",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text("Today: \$1,250.00")
                    Text("This week: \$8,750.00")
                    Text("This month: \$35,200.00")
                }
            }
        }
    }
}

@Composable
fun OrdersContent() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Text(
                text = "Orders",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
        }
        
        val orders = listOf(
            "Order #001 - Oil Change - \$45.00",
            "Order #002 - Brake Service - \$150.00",
            "Order #003 - Tire Replacement - \$300.00",
            "Order #004 - Engine Diagnostic - \$75.00",
            "Order #005 - AC Repair - \$200.00"
        )
        
        items(orders) { order ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Text(
                    text = order,
                    modifier = Modifier.padding(16.dp)
                )
            }
        }
    }
}

@Composable
fun InventoryContent() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Text(
                text = "Inventory",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
        }
        
        val items = listOf(
            "Engine Oil - 25 units",
            "Brake Pads - 12 units",
            "Air Filters - 8 units",
            "Spark Plugs - 30 units",
            "Tires - 15 units"
        )
        
        items(items) { item ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Text(
                    text = item,
                    modifier = Modifier.padding(16.dp)
                )
            }
        }
    }
}

@Composable
fun PaymentsContent() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Text(
                text = "Payments",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
        }
        
        val payments = listOf(
            "Payment #001 - \$45.00 - Completed",
            "Payment #002 - \$150.00 - Pending",
            "Payment #003 - \$300.00 - Completed",
            "Payment #004 - \$75.00 - Processing",
            "Payment #005 - \$200.00 - Completed"
        )
        
        items(payments) { payment ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Text(
                    text = payment,
                    modifier = Modifier.padding(16.dp)
                )
            }
        }
    }
}

@Composable
fun SettingsContent() {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Text(
                text = "Settings",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
        }
        
        val settings = listOf(
            "Profile Settings",
            "Notification Preferences",
            "Language Settings",
            "Dark Mode",
            "About App"
        )
        
        items(settings) { setting ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Text(
                    text = setting,
                    modifier = Modifier.padding(16.dp)
                )
            }
        }
    }
}