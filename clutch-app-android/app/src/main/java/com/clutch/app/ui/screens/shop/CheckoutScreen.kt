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
import com.clutch.app.data.model.CheckoutOrderItem
import com.clutch.app.data.model.EcommercePaymentMethod
import com.clutch.app.data.model.Address

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(
    onNavigateBack: () -> Unit = {},
    onNavigateToPayment: () -> Unit = {},
    onNavigateToAddresses: () -> Unit = {},
    onPlaceOrder: () -> Unit = {}
) {
    val context = LocalContext.current
    var selectedPaymentMethod by remember { mutableStateOf("card") }
    var selectedAddress by remember { mutableStateOf("home") }
    var orderNotes by remember { mutableStateOf("") }

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
                        text = "Checkout",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    
                    Spacer(modifier = Modifier.width(48.dp))
                }
            }
        }
        
        item {
            // Delivery Address
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
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
                            text = "Delivery Address",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                        
                        TextButton(onClick = onNavigateToAddresses) {
                            Text("Change")
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    // Address Details
                    Text(
                        text = "Home",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                    
                    Text(
                        text = "123 Main Street, Apt 4B\nNew York, NY 10001",
                        fontSize = 14.sp,
                        color = Color.Gray,
                        lineHeight = 18.sp
                    )
                    
                    Text(
                        text = "Phone: +1 (555) 123-4567",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(16.dp))
        }
        
        item {
            // Payment Method
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Payment Method",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    // Payment Options
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(getPaymentMethods()) { method ->
                            PaymentMethodCard(
                                method = method,
                                isSelected = selectedPaymentMethod == method.id,
                                onClick = { selectedPaymentMethod = method.id }
                            )
                        }
                    }
                }
            }
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
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
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
                    
                    // Order Items
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(getOrderItems()) { item ->
                            CheckoutOrderItemRow(item = item)
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    HorizontalDivider(color = Color.Gray)
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    // Price Breakdown
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
                            text = "$89.97",
                            fontSize = 14.sp,
                            color = Color.Black
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(4.dp))
                    
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
                    
                    Spacer(modifier = Modifier.height(4.dp))
                    
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
                            text = "$8.99",
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
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                        Text(
                            text = "$98.96",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = ClutchRed
                        )
                    }
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(16.dp))
        }
        
        item {
            // Order Notes
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Order Notes (Optional)",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    OutlinedTextField(
                        value = orderNotes,
                        onValueChange = { orderNotes = it },
                        placeholder = { Text("Add special instructions...") },
                        modifier = Modifier.fillMaxWidth(),
                        maxLines = 3
                    )
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(100.dp)) // Space for bottom bar
        }
    }
    
    // Bottom Action Bar
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White)
            .padding(16.dp)
    ) {
        Button(
            onClick = onPlaceOrder,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text(
                text = "Place Order - $98.96",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.White
            )
        }
    }
}

@Composable
fun PaymentMethodCard(
    method: EcommercePaymentMethod,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) ClutchRed.copy(alpha = 0.1f) else Color.White
        ),
        shape = RoundedCornerShape(8.dp),
        border = if (isSelected) androidx.compose.foundation.BorderStroke(2.dp, ClutchRed) else null
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Image(
                painter = painterResource(id = method.icon),
                contentDescription = method.name,
                modifier = Modifier.size(32.dp)
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = method.name,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black
                )
                Text(
                    text = method.description,
                    fontSize = 12.sp,
                    color = Color.Gray
                )
            }
            
            if (isSelected) {
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = "Selected",
                    tint = ClutchRed,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

@Composable
fun CheckoutOrderItemRow(item: CheckoutOrderItem) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Image(
            painter = painterResource(id = item.image),
            contentDescription = item.name,
            modifier = Modifier.size(40.dp)
        )
        
        Spacer(modifier = Modifier.width(12.dp))
        
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = item.name,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.Black
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
fun getPaymentMethods(): List<EcommercePaymentMethod> {
    return listOf(
        EcommercePaymentMethod("card", "Credit Card", "**** 1234", R.drawable.ic_car_placeholder),
        EcommercePaymentMethod("paypal", "PayPal", "john@example.com", R.drawable.ic_car_placeholder),
        EcommercePaymentMethod("stripe", "Stripe", "**** 5678", R.drawable.ic_car_placeholder)
    )
}

fun getOrderItems(): List<CheckoutOrderItem> {
    return listOf(
        CheckoutOrderItem("Engine Oil 5W-30", 2, "$29.99", R.drawable.ic_car_placeholder),
        CheckoutOrderItem("Air Filter", 1, "$15.99", R.drawable.ic_car_placeholder),
        CheckoutOrderItem("Oil Filter", 1, "$12.99", R.drawable.ic_car_placeholder)
    )
}
