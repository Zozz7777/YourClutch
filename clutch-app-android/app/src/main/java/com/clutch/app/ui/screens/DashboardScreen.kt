package com.clutch.app.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import com.clutch.app.R
import com.clutch.app.ui.theme.*
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.platform.LocalLayoutDirection
import com.clutch.app.utils.TranslationManager
import com.clutch.app.utils.ThemeManager
import com.clutch.app.data.model.Car
import com.clutch.app.ui.components.CartIcon

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    onNavigateToCarHealth: () -> Unit = {},
    onNavigateToBookService: () -> Unit = {},
    onNavigateToOrderParts: () -> Unit = {},
    onNavigateToCommunity: () -> Unit = {},
    onNavigateToLoyalty: () -> Unit = {},
    onNavigateToAddCar: () -> Unit = {},
    onNavigateToMaintenance: () -> Unit = {},
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    
    // Car selection popup state
    var showCarSelectionPopup by remember { mutableStateOf(false) }
    val currentLanguage = TranslationManager.getCurrentLanguage()
    val layoutDirection = if (currentLanguage == "ar") LayoutDirection.Rtl else LayoutDirection.Ltr
    
    // Theme management
    val isDarkTheme = ThemeManager.isDarkTheme(context)
    val colors = if (isDarkTheme) ClutchDarkColors else ClutchColors
    
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    val selectedCar = uiState.selectedCar
    val carHealth = uiState.carHealth
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Box(modifier = Modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(colors.background),
            contentPadding = PaddingValues(horizontal = 0.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
        item {
                // Header with Clutch logo and car info - PROPERLY STRUCTURED
                Column {
                    // Top row with logo and car info
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Clutch Logo - At left side
                        Image(
                            painter = painterResource(id = R.drawable.clutch_logo_red),
                            contentDescription = stringResource(R.string.clutch_logo),
                            modifier = Modifier.size(120.dp, 40.dp)
                        )
                        
                        // Car Info - Centered horizontally
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
                                fontWeight = FontWeight.Medium,
                                color = colors.mutedForeground,
                                textAlign = TextAlign.Center
                            )
                            
                            // Car details - properly structured
                            if (selectedCar != null) {
                                Text(
                                    text = "${selectedCar.brand} ${selectedCar.model}",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.foreground,
                                    textAlign = TextAlign.Center
                                )
                                Text(
                                    text = "${selectedCar.year} • ${selectedCar.trim}",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Light,
                                    color = colors.primary,
                                    textAlign = TextAlign.Center
                                )
                            } else {
                                Text(
                                    text = stringResource(R.string.add_your_car),
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.foreground,
                                    textAlign = TextAlign.Center
                                )
                                Text(
                                    text = "Tap to get started",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Light,
                                    color = colors.mutedForeground,
                                    textAlign = TextAlign.Center
                                )
                            }
                            
                            // Dropdown icon
                            Icon(
                                imageVector = Icons.Default.KeyboardArrowDown,
                                contentDescription = stringResource(R.string.dropdown),
                                tint = colors.mutedForeground,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        
                        // Cart Icon - At right side with proper padding
                        CartIcon(
                            onCartClick = { /* Navigate to cart */ },
                            modifier = Modifier.padding(end = 16.dp)
                        )
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
                        colors = CardDefaults.cardColors(containerColor = colors.card),
                        shape = RoundedCornerShape(8.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp, horizontal = 16.dp),
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
                                    } ?: stringResource(R.string.add_your_car),
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (selectedCar != null) colors.foreground else colors.mutedForeground
                                )
                                if (selectedCar != null) {
                                    Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                        text = stringResource(R.string.kilometers),
                                        fontSize = 18.sp,
                                    fontWeight = FontWeight.Black,
                                    color = colors.foreground
                                )
                                }
                            }
                            
                            // Edit icon
                            Icon(
                                imageVector = Icons.Default.Edit,
                                contentDescription = stringResource(R.string.edit_mileage),
                                tint = colors.mutedForeground,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                    }
            }
        }
        
        item {
            // Action Cards - Find Service Centers and Shop Car Parts
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                horizontalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                // Find Service Centers Card
                ActionCard(
                    title = stringResource(R.string.find_service_centers),
                    imageResId = R.drawable.mechanic_home,
                    onClick = onNavigateToBookService,
                    modifier = Modifier.weight(1f)
                )
                
                // Shop Car Parts Card
                ActionCard(
                    title = stringResource(R.string.shop_car_parts),
                    imageResId = R.drawable.parts_home,
                    onClick = onNavigateToOrderParts,
                    modifier = Modifier.weight(1f)
                )
            }
        }
        
        item {
            // Original Carousel Section
            CarouselSection()
        }
        
        item {
                // Combined Car Health and Parts Expiring Soon Card - Original Semicircle with Fixed Spacing
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                colors = CardDefaults.cardColors(containerColor = colors.card),
                shape = RoundedCornerShape(12.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                        // Semicircle Progress Bar - Larger Design
                    Box(
                            modifier = Modifier.size(200.dp), // Increased back to 200dp for bigger semicircle
                        contentAlignment = Alignment.Center
                    ) {
                            // Background semicircle
                        androidx.compose.foundation.Canvas(
                            modifier = Modifier.fillMaxSize()
                        ) {
                                val strokeWidth = 20.dp.toPx()
                                
                                // Background semicircle (light gray)
                                drawArc(
                                    color = colors.muted,
                                    startAngle = 180f,
                                    sweepAngle = 180f,
                                    useCenter = false,
                                    style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                                )
                                
                                // Progress semicircle with exact gradient from SVG
                                val healthScore = carHealth?.overallScore ?: 80
                                val progressAngle = (healthScore / 100f) * 180f
                                
                                // Create the exact gradient from the SVG: ED1B24 (100%) to 000000 (80%)
                                val gradient = Brush.verticalGradient(
                                    colors = listOf(
                                        colors.primary, // Start color - 100% opacity
                                        colors.foreground.copy(alpha = 0.8f) // End color - 80% opacity
                                    )
                                )
                                
                                // Draw progress arc with gradient
                            drawArc(
                                    brush = gradient,
                                    startAngle = 180f,
                                    sweepAngle = progressAngle,
                                useCenter = false,
                                    style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                            )
                        }
                        
                            // Center text - positioned inside semicircle
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally,
                                modifier = Modifier.offset(y = (-25).dp) // Adjusted for larger semicircle
                            ) {
                                Text(
                                    text = "${carHealth?.overallScore ?: 80}%",
                                    fontSize = 48.sp, // Increased for bigger text
                                    fontWeight = FontWeight.Black,
                                    color = colors.foreground
                                )
                                Text(
                                    text = stringResource(R.string.your_car_health),
                                    fontSize = 14.sp, // Increased for better readability
                                    color = colors.mutedForeground
                                )
                            }
                        }
                        
                        // Parts Expiring Soon Section - Attached to semicircle
                        Text(
                            text = stringResource(R.string.parts_expiring_soon),
                            fontSize = 22.sp, // Made much bigger
                            fontWeight = FontWeight.Black, // Made bolder
                            color = colors.primary, // Made red to be very visible
                            textAlign = TextAlign.Center,
                            modifier = Modifier
                                .offset(y = (-50).dp) // Much more negative to pull it very close
                                .padding(top = 2.dp, bottom = 1.dp) // Minimal padding
                        )
                    
                        // Parts list - positioned right after text
                    PartItem(
                            partName = stringResource(R.string.engine_oil),
                            status = stringResource(R.string.expired_850_km_ago),
                        isExpired = true
                    )
                    PartItem(
                            partName = stringResource(R.string.spark_plugs),
                            status = "9,150 " + stringResource(R.string.remaining_km),
                            isExpired = false
                    )
                    PartItem(
                            partName = stringResource(R.string.air_filter),
                            status = "4,150 " + stringResource(R.string.remaining_km),
                            isExpired = false
                    )
                    PartItem(
                            partName = stringResource(R.string.brakes),
                            status = "29,150 " + stringResource(R.string.remaining_km),
                            isExpired = false
                    )
                        
                        Spacer(modifier = Modifier.height(4.dp))
                    
                    Text(
                            text = stringResource(R.string.view_all),
                            fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.foreground,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.clickable { onNavigateToOrderParts() }
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
            onCarSelected = { car ->
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
    }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ActionCard(
    title: String,
    imageResId: Int,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = onClick,
        modifier = modifier.height(120.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Image(
                painter = painterResource(id = imageResId),
                contentDescription = title,
                modifier = Modifier
                    .size(50.dp)
                    .padding(bottom = 4.dp)
            )
            Text(
                text = title,
                fontSize = 18.sp,
                fontWeight = FontWeight.Black,
                color = ClutchRed,
                textAlign = TextAlign.Center,
                maxLines = 2,
                lineHeight = 20.sp
            )
        }
    }
}

@Composable
private fun CarSelectionPopup(
    onDismiss: () -> Unit,
    onCarSelected: (String) -> Unit,
    onAddNewCar: () -> Unit,
    userCars: List<Car>
) {
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.foreground.copy(alpha = 0.5f))
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
                        text = stringResource(R.string.select_car),
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.primary
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = stringResource(R.string.close),
                            tint = colors.mutedForeground
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Car List
                if (userCars.isEmpty()) {
                    // No cars message
                    Text(
                        text = stringResource(R.string.no_cars_found),
                        fontSize = 16.sp,
                        color = colors.mutedForeground,
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
                        color = colors.cardForeground
                    )
                }
            }
        }
    }
}

@Composable
private fun CarSelectionItem(
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
private fun PartItem(
    partName: String,
    status: String,
    isExpired: Boolean = false
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 3.dp), // Reduced for tighter spacing
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = partName,
            fontSize = 18.sp, // Increased from 15sp
            fontWeight = FontWeight.Bold, // Made bolder
            color = if (isExpired) colors.primary else colors.foreground
        )
        Text(
            text = status,
            fontSize = 16.sp, // Increased from 13sp
            fontWeight = FontWeight.Bold, // Made bolder
            color = if (isExpired) colors.primary else colors.mutedForeground
        )
    }
}

@Composable
private fun getCarLogo(brand: String): Int {
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
        "NISSAN" -> R.drawable.ic_car_placeholder
        "HYUNDAI" -> R.drawable.ic_car_placeholder
        "KIA" -> R.drawable.ic_car_placeholder
        "MAZDA" -> R.drawable.ic_car_placeholder
        "SUBARU" -> R.drawable.ic_car_placeholder
        "LEXUS" -> R.drawable.ic_car_placeholder
        "INFINITI" -> R.drawable.ic_car_placeholder
        "ACURA" -> R.drawable.ic_car_placeholder
        "JEEP" -> R.drawable.ic_car_placeholder
        "DODGE" -> R.drawable.ic_car_placeholder
        "CHRYSLER" -> R.drawable.ic_car_placeholder
        "BUICK" -> R.drawable.ic_car_placeholder
        "CADILLAC" -> R.drawable.ic_car_placeholder
        "LINCOLN" -> R.drawable.ic_car_placeholder
        "GMC" -> R.drawable.ic_car_placeholder
        "RAM" -> R.drawable.ic_car_placeholder
        "ALFA ROMEO" -> R.drawable.ic_car_placeholder
        "FIAT" -> R.drawable.ic_car_placeholder
        "JAGUAR" -> R.drawable.ic_car_placeholder
        "LAND ROVER" -> R.drawable.ic_car_placeholder
        "MINI" -> R.drawable.ic_car_placeholder
        "PORSCHE" -> R.drawable.ic_car_placeholder
        "BENTLEY" -> R.drawable.ic_car_placeholder
        "ROLLS ROYCE" -> R.drawable.ic_car_placeholder
        "ASTON MARTIN" -> R.drawable.ic_car_placeholder
        "MASERATI" -> R.drawable.ic_car_placeholder
        "FERRARI" -> R.drawable.ic_car_placeholder
        "LAMBORGHINI" -> R.drawable.ic_car_placeholder
        "MCLAREN" -> R.drawable.ic_car_placeholder
        "BUGATTI" -> R.drawable.ic_car_placeholder
        "KOENIGSEGG" -> R.drawable.ic_car_placeholder
        "PAGANI" -> R.drawable.ic_car_placeholder
        "RIMAC" -> R.drawable.ic_car_placeholder
        "LOTUS" -> R.drawable.ic_car_placeholder
        "SPYKER" -> R.drawable.ic_car_placeholder
        else -> R.drawable.ic_car_placeholder
    }
}

@Composable
private fun CarouselSection() {
    val carouselItems = listOf(
        CarouselItem(
            title = "Special Offers",
            subtitle = "Get 20% off on your next service",
            imageResId = R.drawable.ic_car_placeholder,
            backgroundColor = ClutchRed.copy(alpha = 0.1f)
        ),
        CarouselItem(
            title = "New Features",
            subtitle = "Track your maintenance history",
            imageResId = R.drawable.ic_car_placeholder,
            backgroundColor = ClutchColors.primary.copy(alpha = 0.1f)
        ),
        CarouselItem(
            title = "Expert Tips",
            subtitle = "Learn how to maintain your car",
            imageResId = R.drawable.ic_car_placeholder,
            backgroundColor = ClutchColors.success.copy(alpha = 0.1f)
        )
    )
    
    LazyRow(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp),
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        items(carouselItems.size) { index ->
            CarouselCard(item = carouselItems[index])
        }
    }
}

@Composable
private fun CarouselCard(item: CarouselItem) {
    Card(
        modifier = Modifier
            .width(280.dp)
            .height(140.dp),
        colors = CardDefaults.cardColors(containerColor = item.backgroundColor),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = item.title,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = ClutchColors.foreground
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = item.subtitle,
                    fontSize = 14.sp,
                    color = ClutchColors.mutedForeground
                )
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Image(
                painter = painterResource(id = item.imageResId),
                contentDescription = item.title,
                modifier = Modifier.size(60.dp)
            )
        }
    }
}

data class CarouselItem(
    val title: String,
    val subtitle: String,
    val imageResId: Int,
    val backgroundColor: Color
)

data class CarouselImageItem(
    val imageResId: Int,
    val title: String,
    val subtitle: String,
    val backgroundColor: Color
)

data class AmazonCarouselItem(
    val title: String,
    val subtitle: String,
    val imageResId: Int,
    val onClick: () -> Unit
)

@Composable
private fun CarouselImageCard(
    item: CarouselImageItem,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(item.backgroundColor)
    ) {
        // Background image
        Image(
            painter = painterResource(id = item.imageResId),
            contentDescription = item.title,
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            contentScale = ContentScale.Crop
        )
        
        // Overlay gradient for better text readability
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color.Transparent,
                            colors.foreground.copy(alpha = 0.3f)
                        )
                    )
                )
        )
        
        // Text content
        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(24.dp)
        ) {
            Text(
                text = item.title,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = item.subtitle,
                fontSize = 16.sp,
                color = colors.cardForeground.copy(alpha = 0.9f)
            )
        }
    }
}

@Composable
private fun AmazonStyleCard(
    item: AmazonCarouselItem,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = item.onClick,
        modifier = modifier
            .width(160.dp)
            .height(200.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Title at the top
            Text(
                text = item.title,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = colors.foreground,
                textAlign = TextAlign.Center,
                maxLines = 2
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Product image - prominent and centered
            Image(
                painter = painterResource(id = item.imageResId),
                contentDescription = item.title,
                modifier = Modifier
                    .size(80.dp)
                    .padding(vertical = 8.dp),
                contentScale = ContentScale.Fit
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Subtitle at the bottom
            Text(
                text = item.subtitle,
                fontSize = 12.sp,
                color = colors.mutedForeground,
                textAlign = TextAlign.Center,
                maxLines = 2
            )
        }
    }
}