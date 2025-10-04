package com.clutch.app.ui.screens.shop

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.material3.HorizontalDivider
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
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
fun ProductDetailScreen(
    productId: String,
    onNavigateBack: () -> Unit = {},
    onNavigateToCart: () -> Unit = {},
    onAddToFavorites: () -> Unit = {},
    onAddToCart: () -> Unit = {}
) {
    val context = LocalContext.current
    var selectedImageIndex by remember { mutableStateOf(0) }
    var quantity by remember { mutableStateOf(1) }
    var selectedSize by remember { mutableStateOf("") }
    var isFavorite by remember { mutableStateOf(false) }

    // Sample product data
    val product = getProductById(productId)

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
                    
                    Row {
                        IconButton(onClick = onAddToFavorites) {
                            Icon(
                                imageVector = if (isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                                contentDescription = "Favorite",
                                tint = if (isFavorite) ClutchRed else Color.Black,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        IconButton(onClick = onNavigateToCart) {
                            Icon(
                                imageVector = Icons.Default.ShoppingCart,
                                contentDescription = "Cart",
                                tint = Color.Black,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    }
                }
            }
        }
        
        item {
            // Product Images
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(300.dp)
                    .background(Color(0xFFF5F5F5))
            ) {
                // Main product image
                Image(
                    painter = painterResource(id = product.images[selectedImageIndex]),
                    contentDescription = product.name,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                )
                
                // Image indicators
                Row(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    product.images.forEachIndexed { index, _ ->
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .clip(CircleShape)
                                .background(
                                    if (index == selectedImageIndex) ClutchRed else Color.Gray
                                )
                        )
                    }
                }
            }
        }
        
        item {
            // Product Info
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = product.name,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                // Rating and Reviews
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        repeat(5) {
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = "Star",
                                tint = Color(0xFFFFD700),
                                modifier = Modifier.size(16.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = product.rating.toString(),
                            fontSize = 14.sp,
                            color = Color.Gray
                        )
                    }
                    
                    Spacer(modifier = Modifier.width(16.dp))
                    
                    Text(
                        text = "(${product.reviewCount} reviews)",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Price
                Text(
                    text = product.price,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = ClutchRed
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Size Selection (if applicable)
                if (product.sizes.isNotEmpty()) {
                    Text(
                        text = "Size:",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(product.sizes) { size ->
                            SizeChip(
                                size = size,
                                isSelected = selectedSize == size,
                                onClick = { selectedSize = size }
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                }
                
                // Description
                Text(
                    text = "Description",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = product.description,
                    fontSize = 14.sp,
                    color = Color.Gray,
                    lineHeight = 20.sp
                )
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(24.dp))
        }
        
        item {
            // Reviews Section
            Column(
                modifier = Modifier.padding(horizontal = 16.dp)
            ) {
                Text(
                    text = "Reviews",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(getProductReviews()) { review ->
                        ReviewCard(review = review)
                    }
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
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Quantity Selector
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5)),
                shape = RoundedCornerShape(8.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { if (quantity > 1) quantity-- }
                    ) {
                        Icon(
                            imageVector = Icons.Default.Remove,
                            contentDescription = "Decrease",
                            modifier = Modifier.size(16.dp)
                        )
                    }
                    
                    Text(
                        text = quantity.toString(),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                    
                    IconButton(
                        onClick = { quantity++ }
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Increase",
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
            
            // Add to Cart Button
            Button(
                onClick = onAddToCart,
                modifier = Modifier.weight(1f),
                colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = "Add to Cart",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.White
                )
            }
        }
    }
}

@Composable
fun SizeChip(
    size: String,
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
            text = size,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = if (isSelected) Color.White else Color.Black,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
        )
    }
}

@Composable
fun ReviewCard(
    review: ProductReview
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = review.userName,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black
                )
                
                Row(verticalAlignment = Alignment.CenterVertically) {
                    repeat(5) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = "Star",
                            tint = if (it < review.rating) Color(0xFFFFD700) else Color.Gray,
                            modifier = Modifier.size(12.dp)
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = review.comment,
                fontSize = 14.sp,
                color = Color.Gray,
                lineHeight = 18.sp
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = review.date,
                fontSize = 12.sp,
                color = Color.Gray
            )
        }
    }
}

// Data classes
data class ProductDetail(
    val id: String,
    val name: String,
    val price: String,
    val rating: Float,
    val reviewCount: Int,
    val images: List<Int>,
    val sizes: List<String> = emptyList(),
    val description: String
)

data class ProductReview(
    val userName: String,
    val rating: Int,
    val comment: String,
    val date: String
)

// Sample data
fun getProductById(id: String): ProductDetail {
    return ProductDetail(
        id = id,
        name = "Extreme Gloss Shampoo Dark",
        price = "1,300৳",
        rating = 4.7f,
        reviewCount = 128,
        images = listOf(
            R.drawable.ic_car_placeholder,
            R.drawable.ic_car_placeholder,
            R.drawable.ic_car_placeholder
        ),
        sizes = listOf("500ml", "1L", "2L"),
        description = "Premium car shampoo designed for dark colored vehicles. Provides excellent cleaning power while maintaining the shine and protection of your car's paint. Safe for all paint types and easy to use."
    )
}

fun getProductReviews(): List<ProductReview> {
    return listOf(
        ProductReview(
            userName = "Ahmed Hassan",
            rating = 5,
            comment = "Excellent product! My car looks amazing after using this shampoo. Highly recommended!",
            date = "2 days ago"
        ),
        ProductReview(
            userName = "Sarah Ali",
            rating = 4,
            comment = "Good quality shampoo, works well on my black car. The shine is noticeable.",
            date = "1 week ago"
        ),
        ProductReview(
            userName = "Mohamed Omar",
            rating = 5,
            comment = "Best car shampoo I've used. Worth every penny!",
            date = "2 weeks ago"
        )
    )
}
