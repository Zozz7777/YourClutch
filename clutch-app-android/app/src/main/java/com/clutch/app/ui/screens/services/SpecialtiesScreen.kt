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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.hilt.navigation.compose.hiltViewModel
import com.clutch.app.R
import com.clutch.app.ui.theme.*
import com.clutch.app.ui.screens.DashboardViewModel
import com.clutch.app.data.model.Car

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SpecialtiesScreen(
    onNavigateBack: () -> Unit = {},
    onNavigateToServiceCenters: (String) -> Unit = {},
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val selectedCar = uiState.selectedCar

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF5F5F5)),
        contentPadding = PaddingValues(0.dp)
    ) {
        item {
            // Header
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(ClutchRed)
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
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Find Mechanics",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        
                        Spacer(modifier = Modifier.height(4.dp))
                        
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.DirectionsCar,
                                contentDescription = "Car",
                                tint = Color.White,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = selectedCar?.let { "${it.brand} ${it.model} ${it.year}" } ?: "DS 7 crossback 2020",
                                fontSize = 12.sp,
                                color = Color.White
                            )
                            Icon(
                                imageVector = Icons.Default.KeyboardArrowDown,
                                contentDescription = "Dropdown",
                                tint = Color.White,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = selectedCar?.trim ?: "OPERA",
                                fontSize = 12.sp,
                                color = Color.White
                            )
                        }
                    }
                    
                    Text(
                        text = "CLUTCH",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
        
        item {
            // Search Bar
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(8.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
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
                        text = "Search For Mechanic Specialty, maintenance center",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
            }
        }
        
        item {
            // Most Popular Specialties
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Most Popular Specialties",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(getPopularSpecialties()) { specialty ->
                        PopularSpecialtyCard(
                            specialty = specialty,
                            onClick = { onNavigateToServiceCenters(specialty.name) }
                        )
                    }
                }
            }
        }
        
        item {
            // Other Specialties
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Other Specialties",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(getOtherSpecialties()) { specialty ->
                        OtherSpecialtyItem(
                            specialty = specialty,
                            onClick = { onNavigateToServiceCenters(specialty.name) }
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
fun PopularSpecialtyCard(
    specialty: Specialty,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .width(140.dp)
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Image(
                painter = painterResource(id = specialty.icon),
                contentDescription = specialty.name,
                modifier = Modifier.size(80.dp)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = specialty.name,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = ClutchRed,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
fun OtherSpecialtyItem(
    specialty: Specialty,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = specialty.iconVector,
                contentDescription = specialty.name,
                tint = ClutchRed,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Text(
                text = specialty.name,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
        }
    }
}

// Data classes
data class Specialty(
    val name: String,
    val icon: Int,
    val iconVector: androidx.compose.ui.graphics.vector.ImageVector
)

fun getPopularSpecialties(): List<Specialty> {
    return listOf(
        Specialty("Auto Body", R.drawable.ic_car_placeholder, Icons.Default.Build),
        Specialty("Engine", R.drawable.ic_car_placeholder, Icons.Default.Build),
        Specialty("Brakes", R.drawable.ic_car_placeholder, Icons.Default.Stop),
        Specialty("Transmission", R.drawable.ic_car_placeholder, Icons.Default.Settings)
    )
}

fun getOtherSpecialties(): List<Specialty> {
    return listOf(
        Specialty("Auto Body", R.drawable.ic_car_placeholder, Icons.Default.Build),
        Specialty("Auto Body", R.drawable.ic_car_placeholder, Icons.Default.Build),
        Specialty("Auto Body", R.drawable.ic_car_placeholder, Icons.Default.Build),
        Specialty("Auto Body", R.drawable.ic_car_placeholder, Icons.Default.Build),
        Specialty("Auto Body", R.drawable.ic_car_placeholder, Icons.Default.Build),
        Specialty("Auto Body", R.drawable.ic_car_placeholder, Icons.Default.Build),
        Specialty("Auto Body", R.drawable.ic_car_placeholder, Icons.Default.Build),
        Specialty("Auto Body", R.drawable.ic_car_placeholder, Icons.Default.Build),
        Specialty("Auto Body", R.drawable.ic_car_placeholder, Icons.Default.Build)
    )
}
