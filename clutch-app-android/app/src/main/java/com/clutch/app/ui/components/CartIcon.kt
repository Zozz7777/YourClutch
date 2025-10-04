package com.clutch.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.utils.CartManager
import com.clutch.app.ui.theme.ClutchColors
import com.clutch.app.ui.theme.ClutchRed

@Composable
fun CartIcon(
    onCartClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val cartCount by remember { mutableStateOf(CartManager.cartCount) }
    
    // Update cart count when CartManager changes
    LaunchedEffect(Unit) {
        // This would be updated when cart changes in a real implementation
    }
    
    Box(
        modifier = modifier
            .clickable { onCartClick() }
    ) {
        Icon(
            imageVector = Icons.Default.ShoppingCart,
            contentDescription = "Shopping Cart",
            tint = ClutchRed,
            modifier = Modifier.size(24.dp)
        )
        
        if (cartCount > 0) {
            Box(
                modifier = Modifier
                    .size(18.dp)
                    .offset(x = 8.dp, y = (-4).dp)
                    .background(
                        color = ClutchRed,
                        shape = CircleShape
                    )
                    .border(
                        width = 1.dp,
                        color = Color.White,
                        shape = CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (cartCount > 99) "99+" else cartCount.toString(),
                    color = Color.White,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
