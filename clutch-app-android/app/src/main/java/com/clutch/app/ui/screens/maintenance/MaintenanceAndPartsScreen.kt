package com.clutch.app.ui.screens.maintenance

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.hilt.navigation.compose.hiltViewModel
import com.clutch.app.R
import com.clutch.app.ui.theme.*
import com.clutch.app.utils.TranslationManager
import com.clutch.app.ui.screens.DashboardViewModel
import com.clutch.app.data.model.Car
import java.text.SimpleDateFormat
import java.util.*
import com.clutch.app.ui.screens.parts.CarSelectionPopup
import com.clutch.app.ui.screens.parts.CarSelectionItem
import com.clutch.app.ui.screens.parts.getCarLogo
import com.clutch.app.ui.screens.maintenance.DatePickerDialog
import com.clutch.app.ui.screens.maintenance.ServicePickerDialog

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MaintenanceAndPartsScreen(
    onNavigateBack: () -> Unit = {},
    onNavigateToAddCar: () -> Unit = {},
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
    
    // Form state
    var selectedDate by remember { mutableStateOf("") }
    var selectedService by remember { mutableStateOf("") }
    var kilometers by remember { mutableStateOf("") }
    var showDatePicker by remember { mutableStateOf(false) }
    var showServicePicker by remember { mutableStateOf(false) }

    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Box(modifier = Modifier.fillMaxSize()) {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFFF5F5F5)),
                contentPadding = PaddingValues(horizontal = 0.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(24.dp)
            ) {
                item {
                    // Header with Clutch logo and car info - EXACT DESIGN
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
                                    color = ClutchColors.mutedForeground,
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
                                        color = if (selectedCar != null) ClutchRed else ClutchColors.mutedForeground,
                                        maxLines = 1
                                    )
                                    
                                    Spacer(modifier = Modifier.width(8.dp))
                                    
                                    // Dropdown icon next to car text
                                    Icon(
                                        imageVector = Icons.Default.KeyboardArrowDown,
                                        contentDescription = "Dropdown",
                                        tint = ClutchColors.mutedForeground,
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
                        
                        // Mileage Display - EXACT DESIGN
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 40.dp)
                                .clickable { 
                                    // TODO: Open mileage edit dialog
                                },
                            colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
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
                                        color = if (selectedCar != null) ClutchColors.foreground else ClutchColors.mutedForeground
                                    )
                                    if (selectedCar != null) {
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text(
                                            text = "km",
                                            fontSize = 18.sp,
                                            fontWeight = FontWeight.Black,
                                            color = ClutchColors.foreground
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
                    // Last Maintenance Section - EXACT DESIGN
                    Column(
                        modifier = Modifier.padding(horizontal = 24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // "Last Maintenance" heading
                        Text(
                            text = "Last Maintenance",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = ClutchRed,
                            textAlign = TextAlign.Center
                        )
                        
                        Spacer(modifier = Modifier.height(24.dp))
                        
                        // Date field
                        OutlinedTextField(
                            value = selectedDate,
                            onValueChange = { },
                            label = { Text("Date") },
                            readOnly = true,
                            enabled = false,
                            trailingIcon = {
                                Icon(
                                    imageVector = Icons.Default.DateRange,
                                    contentDescription = "Date",
                                    tint = Color.Gray
                                )
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { showDatePicker = true },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = ClutchColors.primary,
                                unfocusedBorderColor = ClutchColors.mutedForeground,
                                focusedLabelColor = ClutchColors.primary,
                                unfocusedLabelColor = ClutchColors.mutedForeground,
                                focusedTextColor = ClutchColors.foreground,
                                unfocusedTextColor = ClutchColors.foreground,
                                disabledBorderColor = ClutchColors.mutedForeground,
                                disabledLabelColor = ClutchColors.mutedForeground,
                                disabledTextColor = ClutchColors.foreground
                            ),
                            shape = RoundedCornerShape(8.dp)
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Service field
                        OutlinedTextField(
                            value = selectedService,
                            onValueChange = { },
                            label = { Text("What Did You Do") },
                            readOnly = true,
                            enabled = false,
                            trailingIcon = {
                                Icon(
                                    imageVector = Icons.Default.KeyboardArrowDown,
                                    contentDescription = "Service",
                                    tint = ClutchColors.mutedForeground
                                )
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { showServicePicker = true },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = ClutchColors.primary,
                                unfocusedBorderColor = ClutchColors.mutedForeground,
                                focusedLabelColor = ClutchColors.primary,
                                unfocusedLabelColor = ClutchColors.mutedForeground,
                                focusedTextColor = ClutchColors.foreground,
                                unfocusedTextColor = ClutchColors.foreground,
                                disabledBorderColor = ClutchColors.mutedForeground,
                                disabledLabelColor = ClutchColors.mutedForeground,
                                disabledTextColor = ClutchColors.foreground
                            ),
                            shape = RoundedCornerShape(8.dp)
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Kilometers field
                        OutlinedTextField(
                            value = kilometers,
                            onValueChange = { kilometers = it },
                            label = { Text("Kilometers") },
                            modifier = Modifier.fillMaxWidth(),
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Number
                            ),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = ClutchColors.primary,
                                unfocusedBorderColor = ClutchColors.mutedForeground,
                                focusedLabelColor = ClutchColors.primary,
                                unfocusedLabelColor = ClutchColors.mutedForeground,
                                focusedTextColor = ClutchColors.foreground,
                                unfocusedTextColor = ClutchColors.foreground
                            ),
                            shape = RoundedCornerShape(8.dp)
                        )
                        
                        Spacer(modifier = Modifier.height(32.dp))
                        
                        // CONFIRM button
                        Button(
                            onClick = {
                                if (selectedDate.isNotEmpty() && selectedService.isNotEmpty() && kilometers.isNotEmpty()) {
                                    // TODO: Submit maintenance data to backend
                                    // For now, just show a success message
                                    selectedDate = ""
                                    selectedService = ""
                                    kilometers = ""
                                }
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(56.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                            shape = RoundedCornerShape(8.dp)
                        ) {
                            Text(
                                text = "CONFIRM",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = ClutchColors.card
                            )
                        }
                    }
                }
                
                item {
                    // Your Parts Section
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 24.dp),
                        colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                        shape = RoundedCornerShape(12.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(20.dp)
                        ) {
                            // Header with title only
                            Text(
                                text = "Your Parts",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = ClutchColors.foreground
                            )
                            
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            // Parts list - sorted by expiration (most urgent first)
                            val partsList = listOf(
                                PartItem("Brake Pads", "2,000 km remaining", "High Priority"),
                                PartItem("Engine Oil", "5,000 km remaining", "High Priority"),
                                PartItem("Air Filter", "8,000 km remaining", "Medium Priority"),
                                PartItem("Spark Plugs", "12,000 km remaining", "Low Priority"),
                                PartItem("Battery", "15,000 km remaining", "Low Priority")
                            )
                            
                            partsList.forEach { part ->
                                PartRow(part = part)
                                if (part != partsList.last()) {
                                    Spacer(modifier = Modifier.height(12.dp))
                                }
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
                    onCarSelected = { carId: String ->
                        // TODO: Implement car selection logic
                        showCarSelectionPopup = false
                    },
                    onAddNewCar = {
                        showCarSelectionPopup = false
                        onNavigateToAddCar()
                    },
                    userCars = uiState.cars
                )
            }
            
            // Date Picker Dialog
            if (showDatePicker) {
                DatePickerDialog(
                    onDateSelected = { date: String ->
                        selectedDate = date
                        showDatePicker = false
                    },
                    onDismiss = { showDatePicker = false }
                )
            }
            
            // Service Picker Dialog
            if (showServicePicker) {
                ServicePickerDialog(
                    onServiceSelected = { service: String ->
                        selectedService = service
                        showServicePicker = false
                    },
                    onDismiss = { showServicePicker = false }
                )
            }
        }
    }
}

// Data classes and components
data class PartItem(
    val name: String,
    val status: String,
    val priority: String
)

@Composable
fun PartRow(part: PartItem) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Priority indicator
        Box(
            modifier = Modifier
                .size(12.dp)
                .background(
                    color = when (part.priority) {
                        "High Priority" -> ClutchColors.destructive
                        "Medium Priority" -> ClutchColors.warning
                        else -> ClutchColors.success
                    },
                    shape = RoundedCornerShape(6.dp)
                )
        )
        
        Spacer(modifier = Modifier.width(12.dp))
        
        // Part icon
        Icon(
            imageVector = getPartIcon(part.name),
            contentDescription = part.name,
            modifier = Modifier.size(24.dp),
            tint = ClutchColors.primary
        )
        
        Spacer(modifier = Modifier.width(12.dp))
        
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = part.name,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = ClutchColors.foreground
            )
            Text(
                text = part.status,
                fontSize = 14.sp,
                color = ClutchColors.mutedForeground
            )
        }
        
        Text(
            text = part.priority,
            fontSize = 12.sp,
            color = ClutchColors.mutedForeground
        )
    }
}

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
