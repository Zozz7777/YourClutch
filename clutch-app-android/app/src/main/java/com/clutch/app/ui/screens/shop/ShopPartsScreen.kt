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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.R
import com.clutch.app.ui.theme.*
import com.clutch.app.data.model.Product
import com.clutch.app.data.model.ProductCategory
import com.clutch.app.utils.ThemeManager
import androidx.compose.ui.platform.LocalContext

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShopPartsScreen(
    onNavigateToCart: () -> Unit = {},
    onNavigateToOrders: () -> Unit = {},
    onNavigateToWishlist: () -> Unit = {},
    onNavigateToSearch: () -> Unit = {}
) {
    val context = LocalContext.current
    
    // Theme management
    val isDarkTheme = ThemeManager.isDarkTheme(context)
    val colors = if (isDarkTheme) ClutchDarkColors else ClutchColors
    
    var selectedCategory by remember { mutableStateOf("All") }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background),
        contentPadding = PaddingValues(0.dp)
    ) {
        item {
            // Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(colors.background)
                    .padding(16.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = stringResource(R.string.shop_parts),
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.foreground
                    )
                    
                    Row {
                        IconButton(onClick = onNavigateToWishlist) {
                            Icon(
                                imageVector = Icons.Default.FavoriteBorder,
                                contentDescription = stringResource(R.string.wishlist),
                                tint = colors.foreground,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        
                        IconButton(onClick = onNavigateToCart) {
                            Icon(
                                imageVector = Icons.Default.ShoppingCart,
                                contentDescription = stringResource(R.string.cart),
                                tint = Color.Black,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    }
                }
            }
        }
        
        item {
            // Search Bar
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5)),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = stringResource(R.string.search),
                        tint = Color.Gray,
                        modifier = Modifier.size(20.dp)
                    )
                    
                    Spacer(modifier = Modifier.width(12.dp))
                    
                    Text(
                        text = stringResource(R.string.search_products),
                        fontSize = 16.sp,
                        color = colors.mutedForeground,
                        modifier = Modifier.weight(1f)
                    )
                    
                    IconButton(onClick = onNavigateToSearch) {
                        Icon(
                            imageVector = Icons.Default.FilterList,
                            contentDescription = stringResource(R.string.filter),
                            tint = Color.Gray,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(16.dp))
        }
        
        item {
            // Categories
            Text(
                text = stringResource(R.string.categories),
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                        color = colors.foreground,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        }
        
        item {
            Spacer(modifier = Modifier.height(12.dp))
        }
        
        item {
            // Category Cards Slider
            LazyRow(
                modifier = Modifier.padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(getShopCategories()) { category ->
                    ShopCategoryCard(
                        category = category,
                        isSelected = selectedCategory == category.name,
                        onClick = { selectedCategory = category.name }
                    )
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(20.dp))
        }
        
        item {
            // Featured Products
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = stringResource(R.string.featured_products),
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                        color = colors.foreground
                )
                
                TextButton(onClick = { /* View all */ }) {
                    Text(
                        text = stringResource(R.string.view_all),
                        fontSize = 14.sp,
                        color = ClutchRed
                    )
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(12.dp))
        }
        
        item {
            // Products Grid
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(horizontal = 16.dp)
            ) {
                items(getFeaturedProducts()) { product ->
                    ProductCard(
                        product = product,
                        onProductClick = { /* Navigate to product detail */ },
                        onAddToCart = { /* Add to cart */ },
                        onAddToWishlist = { /* Add to wishlist */ }
                    )
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(20.dp))
        }
        
        item {
            // Best Selling
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = stringResource(R.string.best_selling),
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                        color = colors.foreground
                )
                
                TextButton(onClick = { /* View all */ }) {
                    Text(
                        text = stringResource(R.string.view_all),
                        fontSize = 14.sp,
                        color = ClutchRed
                    )
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(12.dp))
        }
        
        item {
            // Best Selling Products
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(horizontal = 16.dp)
            ) {
                items(getBestSellingProducts()) { product ->
                    ProductCard(
                        product = product,
                        onProductClick = { /* Navigate to product detail */ },
                        onAddToCart = { /* Add to cart */ },
                        onAddToWishlist = { /* Add to wishlist */ }
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
fun ShopCategoryCard(
    category: ProductCategory,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .size(100.dp), // Big square like restaurants slider
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        shape = RoundedCornerShape(16.dp), // Rounded corners like restaurants
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Category image - takes most of the space
            Image(
                painter = painterResource(id = category.icon),
                contentDescription = category.name,
                modifier = Modifier
                    .size(50.dp)
                    .padding(bottom = 8.dp)
            )
            
            // Category name below the image
            Text(
                text = category.name,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                        color = colors.foreground,
                textAlign = TextAlign.Center,
                maxLines = 2
            )
        }
    }
}

@Composable
fun ProductCard(
    product: Product,
    onProductClick: () -> Unit,
    onAddToCart: () -> Unit,
    onAddToWishlist: () -> Unit
) {
    Card(
        onClick = onProductClick,
        modifier = Modifier
            .width(160.dp),
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
                    painter = painterResource(id = product.image),
                    contentDescription = product.name,
                    modifier = Modifier.size(80.dp)
                )
                
                // Wishlist button
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .background(Color.White, RoundedCornerShape(16.dp))
                        .padding(4.dp)
                ) {
                    IconButton(
                        onClick = onAddToWishlist,
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(
                            imageVector = if (product.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                            contentDescription = "Wishlist",
                            tint = if (product.isFavorite) ClutchRed else Color.Gray,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Product Info
            Text(
                text = product.name,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                        color = colors.foreground,
                maxLines = 2
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            // Rating
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Star,
                    contentDescription = "Rating",
                    tint = Color(0xFFFF9800),
                    modifier = Modifier.size(12.dp)
                )
                
                Spacer(modifier = Modifier.width(4.dp))
                
                Text(
                    text = "${product.rating}",
                    fontSize = 12.sp,
                    color = colors.mutedForeground
                )
                
                Spacer(modifier = Modifier.width(4.dp))
                
                Text(
                    text = "(${product.reviewCount})",
                    fontSize = 12.sp,
                    color = colors.mutedForeground
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Price
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = product.price,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = ClutchRed
                    )
                    
                    if (product.originalPrice != null) {
                        Text(
                            text = product.originalPrice,
                            fontSize = 12.sp,
                            color = colors.mutedForeground
                        )
                    }
                }
                
                IconButton(
                    onClick = onAddToCart,
                    modifier = Modifier
                        .background(ClutchRed, RoundedCornerShape(8.dp))
                        .size(32.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Add to Cart",
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

// Sample data functions
fun getShopCategories(): List<ProductCategory> {
    return listOf(
        ProductCategory("1", "All", R.drawable.ic_car_placeholder, 0),
        ProductCategory("2", "Engine", R.drawable.ic_car_placeholder, 45),
        ProductCategory("3", "Brake", R.drawable.ic_car_placeholder, 32),
        ProductCategory("4", "Filter", R.drawable.ic_car_placeholder, 28),
        ProductCategory("5", "Oil", R.drawable.ic_car_placeholder, 67)
    )
}

fun getFeaturedProducts(): List<Product> {
    return listOf(
        Product(
            id = "1",
            name = "Premium Engine Oil 5W-30",
            price = "$29.99",
            originalPrice = "$35.99",
            image = R.drawable.ic_car_placeholder,
            rating = 4.7f,
            reviewCount = 128
        ),
        Product(
            id = "2",
            name = "Ceramic Brake Pads Set",
            price = "$89.99",
            originalPrice = "$109.99",
            image = R.drawable.ic_car_placeholder,
            rating = 4.5f,
            reviewCount = 89
        ),
        Product(
            id = "3",
            name = "High Performance Air Filter",
            price = "$24.99",
            image = R.drawable.ic_car_placeholder,
            rating = 4.2f,
            reviewCount = 156
        )
    )
}

fun getBestSellingProducts(): List<Product> {
    return listOf(
        Product(
            id = "4",
            name = "Iridium Spark Plugs (Set of 4)",
            price = "$45.99",
            originalPrice = "$59.99",
            image = R.drawable.ic_car_placeholder,
            rating = 4.8f,
            reviewCount = 234
        ),
        Product(
            id = "5",
            name = "Synthetic Motor Oil 10W-40",
            price = "$34.99",
            image = R.drawable.ic_car_placeholder,
            rating = 4.6f,
            reviewCount = 178
        ),
        Product(
            id = "6",
            name = "Cabin Air Filter",
            price = "$18.99",
            image = R.drawable.ic_car_placeholder,
            rating = 4.3f,
            reviewCount = 92
        )
    )
}
