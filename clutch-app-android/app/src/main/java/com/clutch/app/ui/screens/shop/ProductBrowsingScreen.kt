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
import com.clutch.app.data.model.Product
import com.clutch.app.data.model.ProductCategory

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductBrowsingScreen(
    onNavigateBack: () -> Unit = {},
    onNavigateToSearch: () -> Unit = {},
    onNavigateToAddVehicle: () -> Unit = {},
    onNavigateToProductDetail: (String) -> Unit = {},
    onNavigateToCategory: (String) -> Unit = {}
) {
    val context = LocalContext.current
    var selectedCategory by remember { mutableStateOf("All") }
    var sortBy by remember { mutableStateOf("Popular") }
    var showFilters by remember { mutableStateOf(false) }

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
                        text = "Browse Products",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    
                    Row {
                        IconButton(onClick = { showFilters = !showFilters }) {
                            Icon(
                                imageVector = Icons.Default.FilterList,
                                contentDescription = "Filter",
                                tint = Color.Black,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        
                        IconButton(onClick = onNavigateToSearch) {
                            Icon(
                                imageVector = Icons.Default.Search,
                                contentDescription = "Search",
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
                onClick = onNavigateToSearch,
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
                        contentDescription = "Search",
                        tint = Color.Gray,
                        modifier = Modifier.size(20.dp)
                    )
                    
                    Spacer(modifier = Modifier.width(12.dp))
                    
                    Text(
                        text = "Search for car parts...",
                        fontSize = 16.sp,
                        color = Color.Gray,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(16.dp))
        }
        
        item {
            // Categories
            Text(
                text = "Categories",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        }
        
        item {
            Spacer(modifier = Modifier.height(12.dp))
        }
        
        item {
            // Category Chips
            LazyRow(
                modifier = Modifier.padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(getBrowseCategories()) { category ->
                    BrowseCategoryChip(
                        category = category,
                        isSelected = selectedCategory == category.name,
                        onClick = { 
                            selectedCategory = category.name
                            onNavigateToCategory(category.name)
                        }
                    )
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(20.dp))
        }
        
        item {
            // Sort and Filter
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Products",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                Row {
                    // Sort Dropdown
                    Card(
                        onClick = { /* Show sort options */ },
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5)),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = sortBy,
                                fontSize = 14.sp,
                                color = Color.Black
                            )
                            
                            Spacer(modifier = Modifier.width(4.dp))
                            
                            Icon(
                                imageVector = Icons.Default.KeyboardArrowDown,
                                contentDescription = "Sort",
                                tint = Color.Gray,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    }
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(12.dp))
        }
        
        item {
            // Products List
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(horizontal = 16.dp)
            ) {
                items(getBrowseProducts()) { product ->
                    ProductListItem(
                        product = product,
                        onProductClick = { onNavigateToProductDetail(product.id) },
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
fun BrowseCategoryChip(
    category: ProductCategory,
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
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Image(
                painter = painterResource(id = category.icon),
                contentDescription = category.name,
                modifier = Modifier.size(16.dp)
            )
            
            Spacer(modifier = Modifier.width(8.dp))
            
            Text(
                text = category.name,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = if (isSelected) Color.White else Color.Black
            )
        }
    }
}

@Composable
fun ProductListItem(
    product: Product,
    onProductClick: () -> Unit,
    onAddToCart: () -> Unit,
    onAddToWishlist: () -> Unit
) {
    Card(
        onClick = onProductClick,
        modifier = Modifier.fillMaxWidth(),
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
                    painter = painterResource(id = product.image),
                    contentDescription = product.name,
                    modifier = Modifier.size(60.dp)
                )
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            // Product Info
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = product.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black,
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
                        modifier = Modifier.size(14.dp)
                    )
                    
                    Spacer(modifier = Modifier.width(4.dp))
                    
                    Text(
                        text = "${product.rating}",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                    
                    Spacer(modifier = Modifier.width(4.dp))
                    
                    Text(
                        text = "(${product.reviewCount})",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
                
                Spacer(modifier = Modifier.height(8.dp))
                
                // Price
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = product.price,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = ClutchRed
                    )
                    
                    if (product.originalPrice != null) {
                        Spacer(modifier = Modifier.width(8.dp))
                        
                        Text(
                            text = product.originalPrice,
                            fontSize = 14.sp,
                            color = Color.Gray
                        )
                    }
                }
            }
            
            // Action Buttons
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                IconButton(
                    onClick = onAddToWishlist,
                    modifier = Modifier
                        .background(
                            if (product.isFavorite) ClutchRed.copy(alpha = 0.1f) else Color.Transparent,
                            RoundedCornerShape(8.dp)
                        )
                ) {
                    Icon(
                        imageVector = if (product.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = "Wishlist",
                        tint = if (product.isFavorite) ClutchRed else Color.Gray,
                        modifier = Modifier.size(20.dp)
                    )
                }
                
                IconButton(
                    onClick = onAddToCart,
                    modifier = Modifier
                        .background(ClutchRed, RoundedCornerShape(8.dp))
                ) {
                    Icon(
                        imageVector = Icons.Default.Add,
                        contentDescription = "Add to Cart",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
    }
}

// Sample data functions
fun getBrowseCategories(): List<ProductCategory> {
    return listOf(
        ProductCategory("1", "All", R.drawable.ic_car_placeholder, 0),
        ProductCategory("2", "Engine", R.drawable.ic_car_placeholder, 45),
        ProductCategory("3", "Brake", R.drawable.ic_car_placeholder, 32),
        ProductCategory("4", "Filter", R.drawable.ic_car_placeholder, 28),
        ProductCategory("5", "Oil", R.drawable.ic_car_placeholder, 67),
        ProductCategory("6", "Electrical", R.drawable.ic_car_placeholder, 23),
        ProductCategory("7", "Suspension", R.drawable.ic_car_placeholder, 41)
    )
}

fun getBrowseProducts(): List<Product> {
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
        ),
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
