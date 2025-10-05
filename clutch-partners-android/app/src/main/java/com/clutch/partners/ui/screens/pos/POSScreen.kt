package com.clutch.partners.ui.screens.pos

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
import androidx.compose.ui.Alignment.Companion.CenterVertically
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.clutch.partners.ClutchPartnersTheme
import com.clutch.partners.data.model.*
import com.clutch.partners.ui.components.PermissionGate
import com.clutch.partners.viewmodel.POSViewModel
import java.text.NumberFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun POSScreen(
    navController: NavController,
    viewModel: POSViewModel = hiltViewModel()
) {
    var showPaymentDialog by remember { mutableStateOf(false) }
    var showCustomerDialog by remember { mutableStateOf(false) }
    var selectedCategory by remember { mutableStateOf("all") }
    
    ClutchPartnersTheme {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = { 
                        Text(
                            "POS System",
                            style = MaterialTheme.typography.headlineSmall,
                            fontWeight = FontWeight.Bold
                        )
                    },
                    actions = {
                        IconButton(onClick = { showCustomerDialog = true }) {
                            Icon(Icons.Default.Person, contentDescription = "Customer")
                        }
                        IconButton(onClick = { /* Settings */ }) {
                            Icon(Icons.Default.Settings, contentDescription = "Settings")
                        }
                    }
                )
            }
        ) { paddingValues ->
            Row(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .background(MaterialTheme.colorScheme.background)
            ) {
                // Products Panel (Left Side)
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .padding(16.dp)
                ) {
                    // Search Bar
                    OutlinedTextField(
                        value = "",
                        onValueChange = { /* Handle search */ },
                        placeholder = { Text("Search products...") },
                        leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Category Filter
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(listOf("all", "brakes", "engine", "electrical", "body", "accessories")) { category ->
                            FilterChip(
                                onClick = { selectedCategory = category },
                                label = { 
                                    Text(
                                        category.replaceFirstChar { it.uppercase() },
                                        style = MaterialTheme.typography.bodySmall
                                    )
                                },
                                selected = selectedCategory == category,
                                modifier = Modifier.clip(RoundedCornerShape(20.dp))
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Products Grid
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(sampleProducts.filter { 
                            selectedCategory == "all" || it.category == selectedCategory 
                        }) { product ->
                            ProductCard(
                                product = product,
                                onProductClick = { viewModel.addToCart(product) }
                            )
                        }
                    }
                }
                
                // Cart Panel (Right Side)
                Card(
                    modifier = Modifier
                        .width(350.dp)
                        .fillMaxHeight()
                        .padding(16.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surface
                    ),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp)
                    ) {
                        Text(
                            text = "Shopping Cart",
                            style = MaterialTheme.typography.titleLarge,
                            fontWeight = FontWeight.Bold,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Cart Items
                        LazyColumn(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(sampleCartItems) { item ->
                                CartItemCard(
                                    item = item,
                                    onQuantityChange = { quantity ->
                                        // Handle quantity change
                                    },
                                    onRemove = {
                                        // Handle remove item
                                    }
                                )
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Cart Summary
                        CartSummary(
                            subtotal = 1250.0,
                            tax = 187.5,
                            discount = 50.0,
                            total = 1387.5,
                            onCheckout = { showPaymentDialog = true }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun ProductCard(
    product: Product,
    onProductClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onProductClick() },
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Product Image/Icon
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(MaterialTheme.colorScheme.primaryContainer),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Inventory,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.size(24.dp)
                )
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            // Product Info
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = product.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1
                )
                
                Text(
                    text = product.sku,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "EGP ${String.format("%.2f", product.price)}",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                    
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    StockStatusChip(status = product.stockStatus)
                }
            }
        }
    }
}

@Composable
fun CartItemCard(
    item: CartItem,
    onQuantityChange: (Int) -> Unit,
    onRemove: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = item.product.name,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Text(
                    text = "EGP ${String.format("%.2f", item.product.price)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            // Quantity Controls
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = { onQuantityChange(item.quantity - 1) },
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        Icons.Default.Remove,
                        contentDescription = "Decrease",
                        modifier = Modifier.size(16.dp)
                    )
                }
                
                Text(
                    text = item.quantity.toString(),
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 8.dp)
                )
                
                IconButton(
                    onClick = { onQuantityChange(item.quantity + 1) },
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        Icons.Default.Add,
                        contentDescription = "Increase",
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
            
            Spacer(modifier = Modifier.width(8.dp))
            
            // Remove Button
            IconButton(
                onClick = onRemove,
                modifier = Modifier.size(32.dp)
            ) {
                Icon(
                    Icons.Default.Delete,
                    contentDescription = "Remove",
                    modifier = Modifier.size(16.dp),
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}

@Composable
fun CartSummary(
    subtotal: Double,
    tax: Double,
    discount: Double,
    total: Double,
    onCheckout: () -> Unit
) {
    Column {
        // Summary Details
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text("Subtotal:", style = MaterialTheme.typography.bodyMedium)
            Text("EGP ${String.format("%.2f", subtotal)}", style = MaterialTheme.typography.bodyMedium)
        }
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text("Tax:", style = MaterialTheme.typography.bodyMedium)
            Text("EGP ${String.format("%.2f", tax)}", style = MaterialTheme.typography.bodyMedium)
        }
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text("Discount:", style = MaterialTheme.typography.bodyMedium)
            Text("-EGP ${String.format("%.2f", discount)}", style = MaterialTheme.typography.bodyMedium)
        }
        
        Divider(modifier = Modifier.padding(vertical = 8.dp))
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text("Total:", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            Text("EGP ${String.format("%.2f", total)}", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Checkout Button
        Button(
            onClick = onCheckout,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.primary
            )
        ) {
            Icon(Icons.Default.Payment, contentDescription = null)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Checkout")
        }
    }
}

@Composable
fun StockStatusChip(status: StockStatus) {
    val (backgroundColor, textColor, text) = when (status) {
        StockStatus.IN_STOCK -> Triple(Color(0xFF4CAF50), Color.White, "In Stock")
        StockStatus.LOW_STOCK -> Triple(Color(0xFFFF9800), Color.White, "Low Stock")
        StockStatus.OUT_OF_STOCK -> Triple(Color(0xFFF44336), Color.White, "Out of Stock")
    }
    
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .background(backgroundColor)
            .padding(horizontal = 8.dp, vertical = 2.dp)
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.bodySmall,
            color = textColor,
            fontWeight = FontWeight.Medium
        )
    }
}

// Sample Data
val sampleProducts = listOf(
    Product(
        id = "1",
        sku = "BRK001",
        name = "Brake Pads - Front",
        description = "High-quality brake pads for front wheels",
        category = "brakes",
        price = 150.0,
        cost = 100.0,
        stock = 25,
        minStock = 5,
        maxStock = 100,
        barcode = "1234567890123"
    ),
    Product(
        id = "2",
        sku = "ENG001",
        name = "Engine Oil 5W-30",
        description = "Synthetic engine oil 5W-30 grade",
        category = "engine",
        price = 80.0,
        cost = 50.0,
        stock = 50,
        minStock = 10,
        maxStock = 200,
        barcode = "1234567890124"
    ),
    Product(
        id = "3",
        sku = "ELC001",
        name = "Spark Plugs Set",
        description = "Set of 4 spark plugs",
        category = "electrical",
        price = 120.0,
        cost = 80.0,
        stock = 3,
        minStock = 5,
        maxStock = 50,
        barcode = "1234567890125"
    )
)

val sampleCartItems = listOf(
    CartItem(
        product = sampleProducts[0],
        quantity = 2,
        discount = 0.0
    ),
    CartItem(
        product = sampleProducts[1],
        quantity = 1,
        discount = 10.0
    )
)
