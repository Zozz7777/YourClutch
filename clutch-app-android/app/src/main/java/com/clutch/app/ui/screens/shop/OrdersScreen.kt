package com.clutch.app.ui.screens.shop

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.R
import com.clutch.app.ui.theme.*
import com.clutch.app.data.model.EcommerceOrder
import com.clutch.app.data.model.EcommerceOrderItem

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersScreen(
    onNavigateBack: () -> Unit = {},
    onNavigateToOrderDetail: (String) -> Unit = {},
    onReorder: (String) -> Unit = {},
    onTrackOrder: (String) -> Unit = {},
    onCancelOrder: (String) -> Unit = {}
) {
    val context = LocalContext.current
    var selectedFilter by remember { mutableStateOf("All") }
    var orders by remember { mutableStateOf(getOrders()) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White),
        contentPadding = PaddingValues(0.dp)
    ) {
        item {
            // Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.Black,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    
                    Text(
                        text = "My Orders",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    
                    IconButton(
                        onClick = { /* Filter orders */ }
                    ) {
                        Icon(
                            imageVector = Icons.Default.FilterList,
                            contentDescription = "Filter",
                            tint = Color.Black,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }
        }
        
        item {
            // Filter Tabs
            LazyRow(
                modifier = Modifier.padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(getOrderFilters()) { filter ->
                    OrderFilterChip(
                        filter = filter,
                        isSelected = selectedFilter == filter,
                        onClick = { selectedFilter = filter }
                    )
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(16.dp))
        }
        
        if (orders.isEmpty()) {
            item {
                // Empty Orders
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.Receipt,
                        contentDescription = "Empty Orders",
                        tint = Color.Gray,
                        modifier = Modifier.size(64.dp)
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text(
                        text = "No orders yet",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        text = "Your order history will appear here",
                        fontSize = 14.sp,
                        color = Color.Gray,
                        textAlign = TextAlign.Center
                    )
                }
            }
        } else {
            // Orders List
            items(orders.filter { 
                selectedFilter == "All" || it.status.lowercase() == selectedFilter.lowercase() 
            }) { order ->
                OrderCard(
                    order = order,
                    onOrderClick = { onNavigateToOrderDetail(order.id) },
                    onReorder = { onReorder(order.id) },
                    onTrackOrder = { onTrackOrder(order.id) },
                    onCancelOrder = { onCancelOrder(order.id) }
                )
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(100.dp)) // Space for bottom navigation
        }
    }
}

@Composable
fun OrderFilterChip(
    filter: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) ClutchRed else Color(0xFFF5F5F5)
        ),
        shape = RoundedCornerShape(20.dp)
    ) {
        Text(
            text = filter,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = if (isSelected) Color.White else Color.Black,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
        )
    }
}

@Composable
fun OrderCard(
    order: EcommerceOrder,
    onOrderClick: () -> Unit,
    onReorder: () -> Unit,
    onTrackOrder: () -> Unit,
    onCancelOrder: () -> Unit
) {
    Card(
        onClick = onOrderClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Order Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Order #${order.id}",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                StatusChip(status = order.status)
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Placed on ${order.orderDate}",
                fontSize = 14.sp,
                color = Color.Gray
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Order Items Preview
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(order.items.take(2)) { item ->
                    OrderItemPreview(item = item)
                }
            }
            
            if (order.items.size > 2) {
                Text(
                    text = "+${order.items.size - 2} more items",
                    fontSize = 14.sp,
                    color = ClutchRed,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Order Total
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Total: ${order.total}",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                Text(
                    text = "Qty: ${order.items.size}",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Action Buttons
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                when (order.status) {
                    "Delivered" -> {
                        Button(
                            onClick = onReorder,
                            colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = "Reorder",
                                fontSize = 12.sp,
                                color = Color.White
                            )
                        }
                    }
                    "Shipped" -> {
                        Button(
                            onClick = onTrackOrder,
                            colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = "Track",
                                fontSize = 12.sp,
                                color = Color.White
                            )
                        }
                    }
                    "Processing" -> {
                        Button(
                            onClick = onCancelOrder,
                            colors = ButtonDefaults.buttonColors(containerColor = Color.Red),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = "Cancel",
                                fontSize = 12.sp,
                                color = Color.White
                            )
                        }
                    }
                }
                
                Button(
                    onClick = onOrderClick,
                    colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                    shape = RoundedCornerShape(8.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, ClutchRed)
                ) {
                    Text(
                        text = "View Details",
                        fontSize = 12.sp,
                        color = ClutchRed
                    )
                }
            }
        }
    }
}

@Composable
fun StatusChip(status: String) {
    val (backgroundColor, textColor) = when (status) {
        "Delivered" -> Color.Green to Color.White
        "Shipped" -> Color(0xFFFF9800) to Color.White
        "Processing" -> Color.Blue to Color.White
        "Cancelled" -> Color.Red to Color.White
        else -> Color.Gray to Color.White
    }
    
    Card(
        colors = CardDefaults.cardColors(containerColor = backgroundColor),
        shape = RoundedCornerShape(12.dp)
    ) {
        Text(
            text = status,
            fontSize = 12.sp,
            fontWeight = FontWeight.SemiBold,
            color = textColor,
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
        )
    }
}

@Composable
fun OrderItemPreview(item: EcommerceOrderItem) {
    Row(
        verticalAlignment = Alignment.CenterVertically
    ) {
        Image(
            painter = painterResource(id = item.image),
            contentDescription = item.name,
            modifier = Modifier.size(32.dp)
        )
        
        Spacer(modifier = Modifier.width(8.dp))
        
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = item.name,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black,
                maxLines = 1
            )
            Text(
                text = "Qty: ${item.quantity}",
                fontSize = 12.sp,
                color = Color.Gray
            )
        }
        
        Text(
            text = item.price,
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold,
            color = ClutchRed
        )
    }
}

// Sample data functions
fun getOrderFilters(): List<String> {
    return listOf("All", "Processing", "Shipped", "Delivered", "Cancelled")
}

fun getOrders(): List<EcommerceOrder> {
    return listOf(
        EcommerceOrder(
            id = "12345",
            orderDate = "Dec 15, 2024",
            status = "Delivered",
            total = "$98.96",
            items = listOf(
                EcommerceOrderItem("1", "Engine Oil 5W-30", "$29.99", 2, R.drawable.ic_car_placeholder),
                EcommerceOrderItem("2", "Air Filter", "$15.99", 1, R.drawable.ic_car_placeholder),
                EcommerceOrderItem("3", "Oil Filter", "$12.99", 1, R.drawable.ic_car_placeholder)
            )
        ),
        EcommerceOrder(
            id = "12344",
            orderDate = "Dec 12, 2024",
            status = "Shipped",
            total = "$89.99",
            items = listOf(
                EcommerceOrderItem("4", "Brake Pads Set", "$89.99", 1, R.drawable.ic_car_placeholder)
            )
        ),
        EcommerceOrder(
            id = "12343",
            orderDate = "Dec 10, 2024",
            status = "Processing",
            total = "$45.99",
            items = listOf(
                EcommerceOrderItem("5", "Spark Plugs Set", "$45.99", 1, R.drawable.ic_car_placeholder)
            )
        )
    )
}
