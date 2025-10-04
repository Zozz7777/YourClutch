package com.clutch.app.ui.screens.shop

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import com.clutch.app.data.model.ProductCategory

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoriesScreen(
    onNavigateBack: () -> Unit = {},
    onNavigateToProductList: (String) -> Unit = {},
    onNavigateToSearch: () -> Unit = {}
) {
    val context = LocalContext.current
    var selectedFilter by remember { mutableStateOf("All") }
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
                        text = "Categories",
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
            // Filter Chips
            LazyRow(
                modifier = Modifier.padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(getCategoryFilters()) { filter ->
                    CategoryFilterChip(
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
        
        item {
            // Categories Grid/List
            if (viewMode == "grid") {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(getProductCategories().size) { index ->
                        val category = getProductCategories()[index]
                        CategoryGridCard(
                            category = category,
                            onClick = { onNavigateToProductList(category.name) }
                        )
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(horizontal = 16.dp)
                ) {
                    items(getProductCategories()) { category ->
                        CategoryListCard(
                            category = category,
                            onClick = { onNavigateToProductList(category.name) }
                        )
                    }
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(100.dp)) // Space for bottom navigation
        }
    }
}

@Composable
fun CategoryFilterChip(
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
fun CategoryGridCard(
    category: ProductCategory,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .height(120.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Image(
                painter = painterResource(id = category.icon),
                contentDescription = category.name,
                modifier = Modifier.size(32.dp)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = category.name,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.Black,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = "${category.productCount} products",
                fontSize = 12.sp,
                color = Color.Gray,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
fun CategoryListCard(
    category: ProductCategory,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Image(
                painter = painterResource(id = category.icon),
                contentDescription = category.name,
                modifier = Modifier.size(40.dp)
            )
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = category.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = "${category.productCount} products available",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
            
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = "View",
                tint = Color.Gray,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

// Sample data functions
fun getCategoryFilters(): List<String> {
    return listOf("All", "Popular", "New", "On Sale", "Featured")
}

fun getProductCategories(): List<ProductCategory> {
    return listOf(
        ProductCategory("1", "Engine Parts", R.drawable.ic_car_placeholder, 45),
        ProductCategory("2", "Brake System", R.drawable.ic_car_placeholder, 32),
        ProductCategory("3", "Filters", R.drawable.ic_car_placeholder, 28),
        ProductCategory("4", "Oil & Fluids", R.drawable.ic_car_placeholder, 67),
        ProductCategory("5", "Tires & Wheels", R.drawable.ic_car_placeholder, 89),
        ProductCategory("6", "Battery", R.drawable.ic_car_placeholder, 23),
        ProductCategory("7", "Lights", R.drawable.ic_car_placeholder, 34),
        ProductCategory("8", "Interior", R.drawable.ic_car_placeholder, 56),
        ProductCategory("9", "Exterior", R.drawable.ic_car_placeholder, 78),
        ProductCategory("10", "Tools", R.drawable.ic_car_placeholder, 12),
        ProductCategory("11", "Accessories", R.drawable.ic_car_placeholder, 91),
        ProductCategory("12", "Maintenance", R.drawable.ic_car_placeholder, 43)
    )
}
