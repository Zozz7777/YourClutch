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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchScreen(
    onNavigateBack: () -> Unit = {},
    onNavigateToProductDetail: (String) -> Unit = {},
    onNavigateToFilter: () -> Unit = {}
) {
    val context = LocalContext.current
    var searchQuery by remember { mutableStateOf("") }
    var showFilters by remember { mutableStateOf(false) }
    var sortBy by remember { mutableStateOf("Relevance") }
    var priceRange by remember { mutableStateOf(0f..1000f) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White),
        contentPadding = PaddingValues(0.dp)
    ) {
        item {
            // Header with Search Bar
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
                    
                    // Search Bar
                    Card(
                        modifier = Modifier.weight(1f),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5)),
                        shape = RoundedCornerShape(8.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Search,
                                contentDescription = "Search",
                                tint = Color.Gray,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            
                            OutlinedTextField(
                                value = searchQuery,
                                onValueChange = { searchQuery = it },
                                placeholder = { Text("Search products...") },
                                modifier = Modifier.weight(1f),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = Color.Transparent,
                                    unfocusedBorderColor = Color.Transparent,
                                    focusedTextColor = Color.Black,
                                    unfocusedTextColor = Color.Black
                                )
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    IconButton(onClick = onNavigateToFilter) {
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
        
        if (searchQuery.isEmpty()) {
            item {
                // Search Suggestions
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Popular Searches",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(getPopularSearches()) { search ->
                            SearchChip(
                                text = search,
                                onClick = { searchQuery = search }
                            )
                        }
                    }
                }
            }
            
            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
            
            item {
                // Categories
                Column(
                    modifier = Modifier.padding(horizontal = 16.dp)
                ) {
                    Text(
                        text = "Browse Categories",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(getSearchCategories()) { category ->
                            CategorySearchCard(
                                category = category,
                                onClick = { searchQuery = category.name }
                            )
                        }
                    }
                }
            }
        } else {
            item {
                // Search Results Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Search Results",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                    
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "Sort by:",
                            fontSize = 14.sp,
                            color = Color.Gray
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        DropdownMenu(
                            expanded = false,
                            onDismissRequest = { }
                        ) {
                            DropdownMenuItem(
                                text = { Text("Relevance") },
                                onClick = { sortBy = "Relevance" }
                            )
                            DropdownMenuItem(
                                text = { Text("Price: Low to High") },
                                onClick = { sortBy = "Price: Low to High" }
                            )
                            DropdownMenuItem(
                                text = { Text("Price: High to Low") },
                                onClick = { sortBy = "Price: High to Low" }
                            )
                            DropdownMenuItem(
                                text = { Text("Rating") },
                                onClick = { sortBy = "Rating" }
                            )
                        }
                        Text(
                            text = sortBy,
                            fontSize = 14.sp,
                            color = ClutchRed
                        )
                    }
                }
            }
            
            item {
                Spacer(modifier = Modifier.height(16.dp))
            }
            
            // Search Results
            items(getSearchResults(searchQuery)) { product ->
                SearchResultCard(
                    product = product,
                    onClick = { onNavigateToProductDetail(product.id) }
                )
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(100.dp)) // Space for bottom navigation
        }
    }
}

@Composable
fun SearchChip(
    text: String,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5)),
        shape = RoundedCornerShape(20.dp)
    ) {
        Text(
            text = text,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = Color.Black,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
        )
    }
}

@Composable
fun CategorySearchCard(
    category: SearchCategory,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.width(100.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = category.icon,
                contentDescription = category.name,
                tint = ClutchRed,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = category.name,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
fun SearchResultCard(
    product: SearchProduct,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
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
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black,
                    maxLines = 2
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = product.category,
                    fontSize = 12.sp,
                    color = Color.Gray
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = product.price,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = ClutchRed
                    )
                    
                    Spacer(modifier = Modifier.width(8.dp))
                    
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = "Star",
                            tint = Color(0xFFFFD700),
                            modifier = Modifier.size(12.dp)
                        )
                        Text(
                            text = product.rating.toString(),
                            fontSize = 12.sp,
                            color = Color.Gray
                        )
                    }
                }
            }
        }
    }
}

// Data classes
data class SearchCategory(
    val name: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector
)

data class SearchProduct(
    val id: String,
    val name: String,
    val category: String,
    val price: String,
    val rating: Float,
    val image: Int
)

// Sample data
fun getPopularSearches(): List<String> {
    return listOf(
        "Engine Oil",
        "Brake Pads",
        "Air Filter",
        "Spark Plugs",
        "Battery",
        "Tires"
    )
}

fun getSearchCategories(): List<SearchCategory> {
    return listOf(
        SearchCategory("Engine", Icons.Default.Build),
        SearchCategory("Brakes", Icons.Default.Stop),
        SearchCategory("Filters", Icons.Default.Air),
        SearchCategory("Oil", Icons.Default.OilBarrel),
        SearchCategory("Tires", Icons.Default.Circle),
        SearchCategory("Battery", Icons.Default.Battery6Bar)
    )
}

fun getSearchResults(query: String): List<SearchProduct> {
    return listOf(
        SearchProduct(
            id = "1",
            name = "Premium Engine Oil 5W-30",
            category = "Engine",
            price = "$29.99",
            rating = 4.5f,
            image = R.drawable.ic_car_placeholder
        ),
        SearchProduct(
            id = "2",
            name = "Ceramic Brake Pads Set",
            category = "Brakes",
            price = "$89.99",
            rating = 4.7f,
            image = R.drawable.ic_car_placeholder
        ),
        SearchProduct(
            id = "3",
            name = "High Performance Air Filter",
            category = "Filters",
            price = "$24.99",
            rating = 4.3f,
            image = R.drawable.ic_car_placeholder
        ),
        SearchProduct(
            id = "4",
            name = "Iridium Spark Plugs (Set of 4)",
            category = "Engine",
            price = "$45.99",
            rating = 4.8f,
            image = R.drawable.ic_car_placeholder
        )
    )
}
