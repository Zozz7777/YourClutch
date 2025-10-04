package com.clutch.app.ui.screens.car

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
fun CarsScreen(
    onNavigateBack: () -> Unit = {},
    onAddCar: () -> Unit = {},
    onEditCar: (String) -> Unit = {},
    onDeleteCar: (String) -> Unit = {},
    onSetDefaultCar: (String) -> Unit = {},
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val currentLanguage = TranslationManager.getCurrentLanguage()
    val layoutDirection = if (currentLanguage == "ar") LayoutDirection.Rtl else LayoutDirection.Ltr
    
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val cars = uiState.cars

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
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = ClutchRed
                        )
                    }
                    Text(
                        text = "My Cars",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    IconButton(onClick = onAddCar) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Add Car",
                            tint = ClutchRed
                        )
                    }
                }
            }
            
            item {
                // Add New Car Card
                Card(
                    onClick = onAddCar,
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchRed),
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
                            imageVector = Icons.Default.Add,
                            contentDescription = "Add Car",
                            tint = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        Text(
                            text = "Add New Car",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.White
                        )
                    }
                }
            }
            
            if (cars.isEmpty()) {
                item {
                    // Empty State
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        shape = RoundedCornerShape(12.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(40.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.DirectionsCar,
                                contentDescription = "No Cars",
                                tint = Color.Gray,
                                modifier = Modifier.size(64.dp)
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = "No cars registered",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.Black
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Add your first car to get started",
                                fontSize = 14.sp,
                                color = Color.Gray,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            } else {
                items(cars) { car ->
                    CarCard(
                        car = car,
                        onEdit = { onEditCar(car.id) },
                        onDelete = { onDeleteCar(car.id) },
                        onSetDefault = { onSetDefaultCar(car.id) }
                    )
                }
            }
            
            item {
                Spacer(modifier = Modifier.height(100.dp)) // Space for bottom navigation
            }
        }
    }
}

@Composable
fun CarCard(
    car: Car,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
    onSetDefault: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            // Header with car info and actions
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    // Car Logo
                    Image(
                        painter = painterResource(id = getCarLogo(car.brand)),
                        contentDescription = "${car.brand} ${car.model}",
                        modifier = Modifier.size(40.dp)
                    )
                    
                    Spacer(modifier = Modifier.width(12.dp))
                    
                    Column {
                        Text(
                            text = "${car.brand} ${car.model} ${car.year}",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                        Text(
                            text = car.trim,
                            fontSize = 14.sp,
                            color = Color.Gray
                        )
                    }
                }
                
                Row {
                    IconButton(onClick = onEdit) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = "Edit",
                            tint = ClutchRed,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    IconButton(onClick = onDelete) {
                        Icon(
                            imageVector = Icons.Default.Delete,
                            contentDescription = "Delete",
                            tint = Color.Red,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Car details
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Mileage
                Column {
                    Text(
                        text = "Mileage",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                    Text(
                        text = "${car.currentMileage?.let { "${it.toString().replace(Regex("\\B(?=(\\d{3})+(?!\\d))"), ",")} km" } ?: "0 km"}",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                }
                
                // Registration Date
                Column {
                    Text(
                        text = "Added",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                    Text(
                        text = "Jan 2024", // TODO: Get from car data
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                }
                
                // Status
                Column {
                    Text(
                        text = "Status",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                    Text(
                        text = "Active",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = ClutchRed
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Set as default button (if not already default)
            TextButton(
                onClick = onSetDefault,
                colors = ButtonDefaults.textButtonColors(contentColor = ClutchRed)
            ) {
                Text(
                    text = "Set as Default",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}

@Composable
fun getCarLogo(brand: String): Int {
    return when (brand.uppercase()) {
        "RENAULT" -> R.drawable.ic_car_placeholder
        "DS" -> R.drawable.ic_car_placeholder
        "VOLKSWAGEN" -> R.drawable.ic_car_placeholder
        "BMW" -> R.drawable.ic_car_placeholder
        "MERCEDES" -> R.drawable.ic_car_placeholder
        "AUDI" -> R.drawable.ic_car_placeholder
        "TOYOTA" -> R.drawable.ic_car_placeholder
        "HONDA" -> R.drawable.ic_car_placeholder
        "FORD" -> R.drawable.ic_car_placeholder
        "CHEVROLET" -> R.drawable.ic_car_placeholder
        else -> R.drawable.ic_car_placeholder
    }
}
