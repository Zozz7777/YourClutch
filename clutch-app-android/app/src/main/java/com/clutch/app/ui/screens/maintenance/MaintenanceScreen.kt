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
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
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
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MaintenanceScreen(
    onNavigateBack: () -> Unit = {},
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    
    // Theme management
    val isDarkTheme = ThemeManager.isDarkTheme(context)
    val colors = if (isDarkTheme) ClutchDarkColors else ClutchColors
    
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
                                contentDescription = stringResource(R.string.clutch_logo),
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
                                    text = stringResource(R.string.your_car),
                        fontSize = 14.sp,
                                    fontWeight = FontWeight.Normal,
                                    color = colors.mutedForeground,
                                    textAlign = TextAlign.Center
                    )
                                
                                // Car details with dropdown in same row
                    Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.DirectionsCar,
                                        contentDescription = stringResource(R.string.car),
                            tint = colors.primary,
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
                                    tint = ClutchColors.mutedForeground,
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
                                    tint = ClutchColors.mutedForeground
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
                                    tint = Color.Gray
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
            
            // Date Picker Dialog
            if (showDatePicker) {
                DatePickerDialog(
                    onDateSelected = { date ->
                        selectedDate = date
                        showDatePicker = false
                    },
                    onDismiss = { showDatePicker = false }
                )
            }
            
            // Service Picker Dialog
            if (showServicePicker) {
                ServicePickerDialog(
                    onServiceSelected = { service ->
                        selectedService = service
                        showServicePicker = false
                    },
                    onDismiss = { showServicePicker = false }
                )
            }
        }
    }
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
            .background(ClutchColors.foreground.copy(alpha = 0.5f))
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
                        color = ClutchColors.mutedForeground,
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
                    color = ClutchColors.foreground
                )
                                        Text(
                    text = "${car.trim} ,${car.currentMileage?.let { "${it.toString().replace(Regex("\\B(?=(\\d{3})+(?!\\d))"), ",")} km" } ?: "0 km"}",
                    fontSize = 14.sp,
                    color = ClutchColors.mutedForeground
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

// Date Picker Dialog
@Composable
fun DatePickerDialog(
    onDateSelected: (String) -> Unit,
    onDismiss: () -> Unit
) {
    val datePickerState = rememberDatePickerState()
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { 
            Text(
                text = "Select Date",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = ClutchRed
            )
        },
        text = {
            DatePicker(state = datePickerState)
        },
        confirmButton = {
                    Button(
                onClick = {
                    datePickerState.selectedDateMillis?.let { millis ->
                        val date = Date(millis)
                        val formatter = SimpleDateFormat("dd/MM/yyyy", Locale.getDefault())
                        onDateSelected(formatter.format(date))
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = ClutchRed)
            ) {
                Text("OK", color = ClutchColors.card)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = ClutchColors.mutedForeground)
            }
        }
    )
}

// Service Picker Dialog
@Composable
fun ServicePickerDialog(
    onServiceSelected: (String) -> Unit,
    onDismiss: () -> Unit
) {
    val services = listOf(
        "Oil Change",
        "Brake Service",
        "Engine Service",
        "Transmission Service",
        "Tire Rotation",
        "Battery Check",
        "Filter Replacement",
        "Other"
    )
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { 
            Text(
                text = "Select Service",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = ClutchRed
            )
        },
        text = {
            Column(
                modifier = Modifier.height(300.dp)
            ) {
                services.forEach { service ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .clickable { onServiceSelected(service) },
                        colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                        shape = RoundedCornerShape(8.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                    ) {
                        Text(
                            text = service,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium,
                            color = ClutchColors.foreground,
                            modifier = Modifier.padding(16.dp)
                        )
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = ClutchColors.mutedForeground)
            }
        }
    )
}