package com.clutch.app.ui.screens.parts

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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.LayoutDirection
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
fun MyPartsScreen(
    onNavigateToMaintenance: () -> Unit = {},
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val currentLanguage = TranslationManager.getCurrentLanguage()
    val layoutDirection = if (currentLanguage == "ar") LayoutDirection.Rtl else LayoutDirection.Ltr
    
    // Car selection popup state
    var showCarSelectionPopup by remember { mutableStateOf(false) }
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    val selectedCar = uiState.selectedCar
    val carHealth = uiState.carHealth

    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
        modifier = Modifier
            .fillMaxSize()
                    .background(Color.White),
                contentPadding = PaddingValues(horizontal = 0.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        item {
                    // Header with Clutch logo and car info - COPIED FROM DASHBOARD
                    Column {
                        // Top row with logo and car info
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                            // Clutch Logo - At absolute left border with minimal padding
                Image(
                    painter = painterResource(id = R.drawable.clutch_logo_red),
                                contentDescription = "Clutch Logo",
                                modifier = Modifier
                                    .size(120.dp, 40.dp)
                                    .padding(start = 0.dp) // Zero padding - at left border
                            )
                            
                            // Car Info - Properly structured with backend data
                Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier
                                    .weight(1f)
                                    .clickable { showCarSelectionPopup = true }
                ) {
                                // "Your Car" text at the top
                    Text(
                                    text = "Your Car",
                        fontSize = 14.sp,
                                    fontWeight = FontWeight.Normal,
                                    color = Color.Gray,
                                    textAlign = TextAlign.Center
                    )
                                
                                // Car details with dropdown in same row
                    Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.DirectionsCar,
                                        contentDescription = "Car",
                            tint = ClutchRed,
                            modifier = Modifier.size(20.dp)
                        )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    
                                    // Car details from backend
                        Text(
                                        text = selectedCar?.let { car ->
                                            "${car.brand} ${car.model} ${car.year}"
                                        } ?: "Add Your Car",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                                        color = if (selectedCar != null) ClutchRed else Color.Gray,
                                        maxLines = 1
                        )
                                    
                                    Spacer(modifier = Modifier.width(8.dp))
                                    
                                    // Dropdown icon next to car text
                        Icon(
                            imageVector = Icons.Default.KeyboardArrowDown,
                                        contentDescription = "Dropdown",
                                        tint = Color.Gray,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                                
                                // Car trim on second line
                    Text(
                                    text = selectedCar?.trim ?: "",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Light,
                                    color = if (selectedCar != null) ClutchRed else Color.Transparent,
                                    textAlign = TextAlign.Center
                                )
                            }
                            
                            // Empty space to balance the layout
                            Spacer(modifier = Modifier.size(120.dp, 40.dp))
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Mileage Display - Connected to backend with real car mileage
                Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 40.dp)
                                .clickable { 
                                    onNavigateToMaintenance()
                                },
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                            shape = RoundedCornerShape(8.dp),
                            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // Mileage from backend
                                Row(
                                    modifier = Modifier.weight(1f),
                                    horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                                        text = selectedCar?.currentMileage?.let { mileage ->
                                            "${mileage.toString().replace(Regex("\\B(?=(\\d{3})+(?!\\d))"), ",")}"
                                        } ?: "Add Your Car",
                                        fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                                        color = if (selectedCar != null) Color.Black else Color.Gray
                                    )
                                    if (selectedCar != null) {
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = "km",
                                            fontSize = 18.sp,
                                            fontWeight = FontWeight.Black,
                            color = Color.Black
                        )
                                    }
                                }
                                
                                // Edit icon
                        Icon(
                            imageVector = Icons.Default.Edit,
                                    contentDescription = "Edit Mileage",
                            tint = Color.Gray,
                                    modifier = Modifier.size(24.dp)
                        )
                    }
                }
            }
        }
        
        item {
                    // Parts Expiring Soon Section
                Column(
                        modifier = Modifier.padding(horizontal = 24.dp)
                ) {
                    Text(
                            text = "Parts Expiring Soon",
                            fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Parts list
                        Column(
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            getPartsData().forEach { part ->
                    PartItem(
                                    partName = part.name,
                                    status = part.status,
                                    isExpired = part.isExpired
                                )
                            }
                        }
                        
            }
        }
        
        item {
                    // Parts Section
                    Column(
                        modifier = Modifier.padding(horizontal = 24.dp)
                    ) {
            Text(
                            text = "Parts",
                            fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Detailed parts list
                        Column(
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            getDetailedPartsData().forEach { part ->
                                DetailedPartItem(
                                    partName = part.name,
                                    status = part.status,
                                    averageExpiry = part.averageExpiry,
                                    icon = part.icon,
                                    isExpired = part.isExpired
                                )
                            }
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(100.dp)) // Space for bottom navigation
                }
            }
            
            // Car Selection Popup - Full Screen Overlay
            if (showCarSelectionPopup) {
                CarSelectionPopup(
                    onDismiss = { showCarSelectionPopup = false },
                    onCarSelected = { carId ->
                        // TODO: Implement car selection logic
                        showCarSelectionPopup = false
                    },
                    onAddNewCar = {
                        showCarSelectionPopup = false
                        // TODO: Navigate to add car screen
                    },
                    userCars = uiState.cars
                )
        }
        }
    }
}

@Composable
fun PartItem(
    partName: String,
    status: String,
    isExpired: Boolean
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Part icon based on part name
            Icon(
                imageVector = getPartIcon(partName),
                contentDescription = partName,
                tint = if (isExpired) ClutchRed else Color.Gray,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(12.dp))
        Text(
            text = partName,
            fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
            color = if (isExpired) ClutchRed else Color.Black
        )
        }
        Text(
            text = status,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = if (isExpired) ClutchRed else Color.Gray
        )
    }
}

@Composable
fun DetailedPartItem(
    partName: String,
    status: String,
    averageExpiry: String,
    icon: Int,
    isExpired: Boolean
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Part icon
                Image(
                    painter = painterResource(id = icon),
                    contentDescription = partName,
                    modifier = Modifier.size(32.dp)
                )
                
                Column {
                Text(
                        text = partName,
                    fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isExpired) ClutchRed else Color.Black
                )
                Text(
                        text = status,
                    fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isExpired) ClutchRed else ClutchRed
                )
                    Text(
                        text = averageExpiry,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Normal,
                        color = Color.Gray
                    )
                }
            }
            
            // Edit icon
            Icon(
                imageVector = Icons.Default.Edit,
                contentDescription = "Edit",
                tint = Color.Gray,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

// Data classes and functions
data class PartData(
    val name: String,
    val status: String,
    val isExpired: Boolean
)

data class DetailedPartData(
    val name: String,
    val status: String,
    val averageExpiry: String,
    val icon: Int,
    val isExpired: Boolean
)

fun getPartsData(): List<PartData> {
    return listOf(
        PartData("Engine Oil", "Expired 850 Km Ago", true),
        PartData("Spark Plugs", "9,150 Km ~ Remaining", false),
        PartData("Air Filter", "4,150 Km ~ Remaining", false),
        PartData("Brakes", "29,150 Km ~ Remaining", false)
    )
}

fun getDetailedPartsData(): List<DetailedPartData> {
    return listOf(
        DetailedPartData(
            "Engine Oil",
            "Expired 850 Km Ago",
            "Average Expiry Is 10,000",
            R.drawable.ic_car_placeholder,
            true
        ),
        DetailedPartData(
            "Brake Linings",
            "150 KM Remaining",
            "Average Expiry Is 30,000 Km",
            R.drawable.ic_car_placeholder,
            false
        ),
        DetailedPartData(
            "Belts",
            "11,150 KM Remaining",
            "Average Expiry Is 40,000 Km",
            R.drawable.ic_car_placeholder,
            false
        ),
        DetailedPartData(
            "Fuel Filter",
            "11,150 KM Remaining",
            "Average Expiry Is 40,000 Km",
            R.drawable.ic_car_placeholder,
            false
        ),
        DetailedPartData(
            "Water Pump",
            "39,150 KM Remaining",
            "Average Expiry Is 60,000 Km",
            R.drawable.ic_car_placeholder,
            false
        ),
        DetailedPartData(
            "Tires",
            "59,150 KM Remaining",
            "Average Expiry Is 80,000 Km Or 2 Years",
            R.drawable.ic_car_placeholder,
            false
        )
    )
}

// Car Selection Popup Components
@Composable
fun CarSelectionPopup(
    onDismiss: () -> Unit,
    onCarSelected: (String) -> Unit,
    onAddNewCar: () -> Unit,
    userCars: List<Car>
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.5f))
            .clickable { onDismiss() }
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 60.dp)
                .align(Alignment.Center),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Select a car",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = ClutchRed
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = Color.Gray
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Car List
                if (userCars.isEmpty()) {
                    // No cars message
                    Text(
                        text = "No cars found. Add your first car!",
                        fontSize = 16.sp,
                        color = Color.Gray,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )
                } else {
                    userCars.forEach { car ->
                        CarSelectionItem(
                            car = car,
                            onSelected = { onCarSelected(car.id) }
                        )
                        if (car != userCars.last()) {
                            Spacer(modifier = Modifier.height(12.dp))
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Add New Car Button
                Button(
                    onClick = onAddNewCar,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = "Add New Car",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
    }
}

@Composable
fun CarSelectionItem(
    car: Car,
    onSelected: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onSelected() },
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
            // Car Logo - Brand-specific logo
            Image(
                painter = painterResource(id = getCarLogo(car.brand)),
                contentDescription = "${car.brand} ${car.model}",
                modifier = Modifier.size(40.dp)
            )

            Spacer(modifier = Modifier.width(16.dp))

            // Car Details
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = "${car.brand} ${car.model} ${car.year}",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                Text(
                    text = "${car.trim} ,${car.currentMileage?.let { "${it.toString().replace(Regex("\\B(?=(\\d{3})+(?!\\d))"), ",")} km" } ?: "0 km"}",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }

            // Selection Checkbox
            Icon(
                imageVector = Icons.Default.RadioButtonUnchecked,
                contentDescription = "Select",
                tint = ClutchRed,
                modifier = Modifier.size(24.dp)
            )
        }
    }
}

@Composable
fun getPartIcon(partName: String): ImageVector {
    return when (partName.uppercase()) {
        "OIL FILTER" -> Icons.Default.OilBarrel
        "AIR FILTER" -> Icons.Default.Air
        "BRAKE PADS" -> Icons.Default.Stop
        "SPARK PLUGS" -> Icons.Default.ElectricBolt
        "BATTERY" -> Icons.Default.Battery6Bar
        "TIRES" -> Icons.Default.Circle
        "ENGINE OIL" -> Icons.Default.OilBarrel
        "TRANSMISSION FLUID" -> Icons.Default.Settings
        "COOLANT" -> Icons.Default.Thermostat
        "BELT" -> Icons.Default.Cable
        "HOSES" -> Icons.Default.Cable
        "LIGHTS" -> Icons.Default.Lightbulb
        "WIPERS" -> Icons.Default.Water
        else -> Icons.Default.Build
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