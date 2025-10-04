package com.clutch.app.ui.screens.shop

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.GridCells
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
import com.clutch.app.data.model.WishlistItem

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WishlistScreen(
    onNavigateBack: () -> Unit = {},
    onNavigateToProductDetail: (String) -> Unit = {},
    onRemoveFromWishlist: (String) -> Unit = {},
    onAddToCart: (String) -> Unit = {}
) {
    val context = LocalContext.current
    var wishlistItems by remember { mutableStateOf(getWishlistItems()) }
    var viewMode by remember { mutableStateOf("grid") } // grid or list

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
                        text = "My Wishlist",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    
                    Row {
                        IconButton(
                            onClick = { viewMode = if (viewMode == "grid") "list" else "grid" }
                        ) {
                            Icon(
                                imageVector = if (viewMode == "grid") Icons.Default.List else Icons.Default.GridView,
                                contentDescription = "View Mode",
                                tint = Color.Black,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        
                        IconButton(
                            onClick = { /* Clear all wishlist */ }
                        ) {
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
        }
        
        if (wishlistItems.isEmpty()) {
            item {
                // Empty Wishlist
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = Icons.Default.FavoriteBorder,
                        contentDescription = "Empty Wishlist",
                        tint = Color.Gray,
                        modifier = Modifier.size(64.dp)
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text(
                        text = "Your wishlist is empty",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        text = "Add some products to your wishlist to see them here",
                        fontSize = 14.sp,
                        color = Color.Gray,
                        textAlign = TextAlign.Center
                    )
                }
            }
        } else {
            item {
                // Wishlist Items Count
                Text(
                    text = "${wishlistItems.size} items in wishlist",
                    fontSize = 14.sp,
                    color = Color.Gray,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
            }
            
            item {
                Spacer(modifier = Modifier.height(8.dp))
            }
            
            if (viewMode == "grid") {
                item {
                    // Grid View
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(wishlistItems.size) { index ->
                            val item = wishlistItems[index]
                            WishlistGridCard(
                                item = item,
                                onProductClick = { onNavigateToProductDetail(item.id) },
                                onRemove = { 
                                    onRemoveFromWishlist(item.id)
                                    wishlistItems = wishlistItems.filter { it.id != item.id }
                                },
                                onAddToCart = { onAddToCart(item.id) }
                            )
                        }
                    }
                }
            } else {
                // List View
                items(wishlistItems) { item ->
                    WishlistListItem(
                        item = item,
                        onProductClick = { onNavigateToProductDetail(item.id) },
                        onRemove = { 
                            onRemoveFromWishlist(item.id)
                            wishlistItems = wishlistItems.filter { it.id != item.id }
                        },
                        onAddToCart = { onAddToCart(item.id) }
                    )
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(100.dp)) // Space for bottom navigation
        }
    }
}

@Composable
fun WishlistGridCard(
    item: WishlistItem,
    onProductClick: () -> Unit,
    onRemove: () -> Unit,
    onAddToCart: () -> Unit
) {
    Card(
        onClick = onProductClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp)
        ) {
            // Product Image
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp)
                    .background(Color(0xFFF5F5F5), RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = item.image),
                    contentDescription = item.name,
                    modifier = Modifier.size(80.dp)
                )
                
                // Remove from wishlist button
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .background(Color.White, RoundedCornerShape(16.dp))
                        .padding(4.dp)
                ) {
                    IconButton(
                        onClick = onRemove,
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Favorite,
                            contentDescription = "Remove",
                            tint = ClutchRed,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Product Info
            Text(
                text = item.name,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.Black,
                maxLines = 2
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = item.price,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = ClutchRed
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Add to Cart Button
            Button(
                onClick = onAddToCart,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = "Add to Cart",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
            }
        }
    }
}

@Composable
fun WishlistListItem(
    item: WishlistItem,
    onProductClick: () -> Unit,
    onRemove: () -> Unit,
    onAddToCart: () -> Unit
) {
    Card(
        onClick = onProductClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
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
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black,
                    maxLines = 2
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = item.price,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = ClutchRed
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = onAddToCart,
                        colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = "Add to Cart",
                            fontSize = 12.sp,
                            color = Color.White
                        )
                    }
                    
                    IconButton(
                        onClick = onRemove
                    ) {
                        Icon(
                            imageVector = Icons.Default.Favorite,
                            contentDescription = "Remove",
                            tint = ClutchRed,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }
}

// Sample data function
fun getWishlistItems(): List<WishlistItem> {
    return listOf(
        WishlistItem(
            id = "1",
            name = "Premium Engine Oil 5W-30",
            price = "$29.99",
            image = R.drawable.ic_car_placeholder,
            addedDate = "2 days ago"
        ),
        WishlistItem(
            id = "2",
            name = "Ceramic Brake Pads Set",
            price = "$89.99",
            image = R.drawable.ic_car_placeholder,
            addedDate = "1 week ago"
        ),
        WishlistItem(
            id = "3",
            name = "High Performance Air Filter",
            price = "$24.99",
            image = R.drawable.ic_car_placeholder,
            addedDate = "3 days ago"
        ),
        WishlistItem(
            id = "4",
            name = "Iridium Spark Plugs (Set of 4)",
            price = "$45.99",
            image = R.drawable.ic_car_placeholder,
            addedDate = "5 days ago"
        )
    )
}
