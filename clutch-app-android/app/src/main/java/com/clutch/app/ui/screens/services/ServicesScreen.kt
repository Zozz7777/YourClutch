package com.clutch.app.ui.screens.services

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
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.hilt.navigation.compose.hiltViewModel
import com.clutch.app.R
import com.clutch.app.ui.theme.*
import com.clutch.app.utils.TranslationManager
import com.clutch.app.ui.screens.DashboardViewModel
import com.clutch.app.data.model.Car

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ServicesScreen(
    onNavigateToMaintenance: () -> Unit = {},
    onNavigateToBookService: () -> Unit = {},
    onNavigateToEmergencyService: () -> Unit = {},
    onNavigateToServiceHistory: () -> Unit = {},
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    
    // Theme management
    val isDarkTheme = ThemeManager.isDarkTheme(context)
    val colors = if (isDarkTheme) ClutchDarkColors else ClutchColors
    
    val currentLanguage = TranslationManager.getCurrentLanguage()
    val layoutDirection = if (currentLanguage == "ar") LayoutDirection.Rtl else LayoutDirection.Ltr
    
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val selectedCar = uiState.selectedCar

    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF5F5F5)),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = stringResource(R.string.services),
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.foreground
                    )
                    IconButton(
                        onClick = { /* TODO: Add notifications or settings */ }
                    ) {
                        Icon(
                            imageVector = Icons.Default.Notifications,
                            contentDescription = stringResource(R.string.notifications),
                            tint = colors.primary,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }
            
            item {
                // Current Car Info
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.DirectionsCar,
                            contentDescription = stringResource(R.string.car),
                            tint = colors.primary,
                            modifier = Modifier.size(32.dp)
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = selectedCar?.let { "${it.brand} ${it.model} ${it.year}" } ?: stringResource(R.string.no_car_selected),
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.foreground
                            )
                            Text(
                                text = selectedCar?.trim ?: stringResource(R.string.add_your_car),
                                fontSize = 14.sp,
                                color = colors.mutedForeground
                            )
                        }
                        if (selectedCar != null) {
                            Text(
                                text = "${selectedCar.currentMileage?.let { "${it.toString().replace(Regex("\\B(?=(\\d{3})+(?!\\d))"), ",")} km" } ?: "0 km"}",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = ClutchRed
                            )
                        }
                    }
                }
            }
            
            item {
                // Quick Actions
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Book Service Card
                    Card(
                        onClick = onNavigateToBookService,
                        modifier = Modifier.weight(1f),
                        colors = CardDefaults.cardColors(containerColor = ClutchRed),
                        shape = RoundedCornerShape(12.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.Build,
                                contentDescription = stringResource(R.string.book_service),
                                tint = colors.cardForeground,
                                modifier = Modifier.size(32.dp)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = stringResource(R.string.book_service),
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = colors.cardForeground,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                    
                    // Emergency Service Card
                    Card(
                        onClick = onNavigateToEmergencyService,
                        modifier = Modifier.weight(1f),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        shape = RoundedCornerShape(12.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.Emergency,
                                contentDescription = "Emergency",
                                tint = Color.Red,
                                modifier = Modifier.size(32.dp)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Emergency",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.Red,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            }
            
            item {
                // Service Categories
                Text(
                    text = "Service Categories",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
            }
            
            item {
                // Service Categories Grid
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(getServiceCategories()) { category ->
                        ServiceCategoryCard(category = category)
                    }
                }
            }
            
            item {
                // Recent Services
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Recent Services",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.foreground
                            )
                            TextButton(
                                onClick = onNavigateToServiceHistory
                            ) {
                                Text(
                                    text = "View All",
                                    color = ClutchRed,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Service History Items
                        val recentServices = listOf(
                            ServiceItem("Oil Change", "Jan 15, 2024", "Completed", "250 EGP"),
                            ServiceItem("Brake Inspection", "Dec 20, 2023", "Completed", "150 EGP"),
                            ServiceItem("Tire Rotation", "Nov 10, 2023", "Completed", "100 EGP")
                        )
                        
                        recentServices.forEach { service ->
                            ServiceHistoryItem(service = service)
                            if (service != recentServices.last()) {
                                Spacer(modifier = Modifier.height(12.dp))
                            }
                        }
                    }
                }
            }
            
            item {
                // Maintenance Reminder
                Card(
                    onClick = onNavigateToMaintenance,
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Schedule,
                            contentDescription = "Maintenance",
                            tint = colors.primary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Maintenance Records",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = colors.foreground
                            )
                            Text(
                                text = "Track your maintenance history",
                                fontSize = 14.sp,
                                color = colors.mutedForeground
                            )
                        }
                        Icon(
                            imageVector = Icons.Default.ChevronRight,
                            contentDescription = "Navigate",
                            tint = Color.Gray,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
            
            item {
                Spacer(modifier = Modifier.height(100.dp)) // Space for bottom navigation
            }
        }
    }
}

// Data classes
data class ServiceCategory(
    val name: String,
    val icon: Int,
    val description: String
)

data class ServiceItem(
    val name: String,
    val date: String,
    val status: String,
    val price: String
)

@Composable
fun ServiceCategoryCard(category: ServiceCategory) {
    Card(
        modifier = Modifier
            .width(120.dp)
            .clickable { /* TODO: Navigate to category */ },
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Image(
                painter = painterResource(id = category.icon),
                contentDescription = category.name,
                modifier = Modifier.size(40.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = category.name,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.Black,
                textAlign = TextAlign.Center
            )
            Text(
                text = category.description,
                fontSize = 12.sp,
                color = Color.Gray,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
fun ServiceHistoryItem(service: ServiceItem) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = service.name,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.Black
            )
            Text(
                text = service.date,
                fontSize = 14.sp,
                color = Color.Gray
            )
        }
        
        Column(horizontalAlignment = Alignment.End) {
            Text(
                text = service.price,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = ClutchRed
            )
            Text(
                text = service.status,
                fontSize = 12.sp,
                color = Color.Green
            )
        }
    }
}

fun getServiceCategories(): List<ServiceCategory> {
    return listOf(
        ServiceCategory("Engine", R.drawable.ic_car_placeholder, "Engine services"),
        ServiceCategory("Brakes", R.drawable.ic_car_placeholder, "Brake system"),
        ServiceCategory("Tires", R.drawable.ic_car_placeholder, "Tire services"),
        ServiceCategory("Battery", R.drawable.ic_car_placeholder, "Battery check"),
        ServiceCategory("Oil", R.drawable.ic_car_placeholder, "Oil changes"),
        ServiceCategory("AC", R.drawable.ic_car_placeholder, "Air conditioning")
    )
}
