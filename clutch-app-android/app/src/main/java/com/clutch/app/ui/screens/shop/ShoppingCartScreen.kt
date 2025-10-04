package com.clutch.app.ui.screens.shop

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.HorizontalDivider
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShoppingCartScreen(
    onNavigateBack: () -> Unit = {},
    onNavigateToCheckout: () -> Unit = {},
    onNavigateToProductDetail: (String) -> Unit = {},
    onRemoveItem: (String) -> Unit = {},
    onUpdateQuantity: (String, Int) -> Unit = { _, _ -> }
) {
    val context = LocalContext.current
    var cartItems by remember { mutableStateOf(getCartItems()) }

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
                        text = "Shopping Cart",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    
                    IconButton(onClick = { /* Clear all */ }) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Clear All",
                            tint = Color.Black,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }
        }
        
        if (cartItems.isEmpty()) {
            item {
                // Empty Cart
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.ShoppingCart,
                        contentDescription = "Empty Cart",
                        tint = Color.Gray,
                        modifier = Modifier.size(64.dp)
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text(
                        text = "Your cart is empty",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        text = "Add some products to get started",
                        fontSize = 14.sp,
                        color = Color.Gray,
                        textAlign = TextAlign.Center
                    )
                }
            }
        } else {
            items(cartItems) { item ->
                CartItemCard(
                    item = item,
                    onProductClick = { onNavigateToProductDetail(item.productId) },
                    onRemoveItem = { 
                        onRemoveItem(item.id)
                        cartItems = cartItems.filter { it.id != item.id }
                    },
                    onUpdateQuantity = { newQuantity ->
                        onUpdateQuantity(item.id, newQuantity)
                        cartItems = cartItems.map { 
                            if (it.id == item.id) it.copy(quantity = newQuantity) else it 
                        }
                    }
                )
            }
            
            item {
                Spacer(modifier = Modifier.height(16.dp))
            }
            
            item {
                // Order Summary
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFF8F9FA)),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Text(
                            text = "Order Summary",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Subtotal",
                                fontSize = 14.sp,
                                color = Color.Gray
                            )
                            Text(
                                text = "$${cartItems.sumOf { it.price * it.quantity }}",
                                fontSize = 14.sp,
                                color = Color.Black
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Shipping",
                                fontSize = 14.sp,
                                color = Color.Gray
                            )
                            Text(
                                text = "Free",
                                fontSize = 14.sp,
                                color = Color.Green
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Tax",
                                fontSize = 14.sp,
                                color = Color.Gray
                            )
                            Text(
                                text = "$${cartItems.sumOf { it.price * it.quantity } * 0.1}",
                                fontSize = 14.sp,
                                color = Color.Black
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        HorizontalDivider(color = Color.Gray)
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "Total",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.Black
                            )
                            Text(
                                text = "$${cartItems.sumOf { it.price * it.quantity } * 1.1}",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = ClutchRed
                            )
                        }
                    }
                }
            }
            
            item {
                Spacer(modifier = Modifier.height(100.dp)) // Space for bottom bar
            }
        }
    }
    
    // Bottom Action Bar
    if (cartItems.isNotEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .padding(16.dp)
        ) {
            Button(
                onClick = onNavigateToCheckout,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = "Proceed to Checkout",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
            }
        }
    }
}

@Composable
fun CartItemCard(
    item: CartItem,
    onProductClick: () -> Unit,
    onRemoveItem: () -> Unit,
    onUpdateQuantity: (Int) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Product Image
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .background(Color(0xFFF5F5F5), RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = item.image),
                    contentDescription = item.name,
                    modifier = Modifier.size(60.dp)
                )
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            // Product Info
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = item.name,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black,
                    maxLines = 2
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = "$${item.price}",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = ClutchRed
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                // Quantity Controls
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { if (item.quantity > 1) onUpdateQuantity(item.quantity - 1) },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Remove,
                            contentDescription = "Decrease",
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    
                    Text(
                        text = item.quantity.toString(),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                    
                    IconButton(
                        onClick = { onUpdateQuantity(item.quantity + 1) },
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Increase",
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
            
            // Remove Button
            IconButton(
                onClick = onRemoveItem,
                modifier = Modifier.size(40.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Delete,
                    contentDescription = "Remove",
                    tint = Color.Red,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

// Data classes
data class CartItem(
    val id: String,
    val productId: String,
    val name: String,
    val price: Double,
    val quantity: Int,
    val image: Int
)

// Sample data
fun getCartItems(): List<CartItem> {
    return listOf(
        CartItem(
            id = "1",
            productId = "1",
            name = "Extreme Gloss Shampoo Dark",
            price = 29.99,
            quantity = 2,
            image = R.drawable.ic_car_placeholder
        ),
        CartItem(
            id = "2",
            productId = "2",
            name = "Air Filter TO-1906F",
            price = 15.99,
            quantity = 1,
            image = R.drawable.ic_car_placeholder
        ),
        CartItem(
            id = "3",
            productId = "3",
            name = "Oil Filter TO-1046",
            price = 12.99,
            quantity = 3,
            image = R.drawable.ic_car_placeholder
        )
    )
}
