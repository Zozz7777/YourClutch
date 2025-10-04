package com.clutch.app.ui.screens.service

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.data.model.ServiceCategory
import com.clutch.app.data.model.ServiceProvider
import com.clutch.app.data.model.WorkingHours
import com.clutch.app.data.model.DaySchedule
import com.clutch.app.ui.theme.ClutchRed
import java.time.LocalDate
import java.time.format.DateTimeFormatter

// Service Category Selection Step
@Composable
fun ServiceCategorySelection(
    categories: List<ServiceCategory>,
    isLoading: Boolean,
    onCategorySelected: (ServiceCategory) -> Unit
) {
    if (isLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = ClutchRed)
        }
        return
    }
    
    Text(
        text = "Select Service Category",
        fontSize = 18.sp,
        fontWeight = FontWeight.SemiBold,
        modifier = Modifier.padding(bottom = 16.dp)
    )
    
    LazyColumn(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(categories) { category ->
            ServiceCategoryCard(
                category = category,
                onCategorySelected = onCategorySelected
            )
        }
    }
}

@Composable
fun ServiceCategoryCard(
    category: ServiceCategory,
    onCategorySelected: (ServiceCategory) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onCategorySelected(category) },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.CarRepair,
                    contentDescription = category.name,
                    tint = ClutchRed,
                    modifier = Modifier.size(32.dp)
                )
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(
                        text = category.name,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                    Text(
                        text = category.description,
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                    Text(
                        text = "Duration: ${category.estimatedDuration} min",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "${category.basePrice} AED",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = ClutchRed
                )
                Icon(
                    imageVector = Icons.Default.ArrowForward,
                    contentDescription = "Select",
                    tint = ClutchRed
                )
            }
        }
    }
}

// Service Provider Selection Step
@Composable
fun ServiceProviderSelection(
    providers: List<ServiceProvider>,
    isLoading: Boolean,
    onProviderSelected: (ServiceProvider) -> Unit,
    onBack: () -> Unit
) {
    if (isLoading) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = ClutchRed)
        }
        return
    }
    
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
            }
            Text(
                text = "Select Service Provider",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(providers) { provider ->
                ServiceProviderCard(
                    provider = provider,
                    onProviderSelected = onProviderSelected
                )
            }
        }
    }
}

@Composable
fun ServiceProviderCard(
    provider: ServiceProvider,
    onProviderSelected: (ServiceProvider) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onProviderSelected(provider) },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = provider.name,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                    Text(
                        text = provider.location,
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = "Rating",
                            tint = Color(0xFFFFD700),
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "${provider.rating}",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                    Text(
                        text = "${provider.reviewCount} reviews",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "${provider.distance} km away",
                    fontSize = 12.sp,
                    color = Color.Gray
                )
                Text(
                    text = provider.phoneNumber,
                    fontSize = 12.sp,
                    color = ClutchRed
                )
            }
        }
    }
}

// Date and Time Selection Step
@Composable
fun DateTimeSelection(
    selectedCategory: ServiceCategory,
    selectedProvider: ServiceProvider,
    onDateTimeSelected: (String, String) -> Unit,
    onBack: () -> Unit
) {
    var selectedDate by remember { mutableStateOf(LocalDate.now().plusDays(1)) }
    var selectedTime by remember { mutableStateOf("09:00") }
    
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
            }
            Text(
                text = "Select Date & Time",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Service Summary
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5))
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Service Summary",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Service: ${selectedCategory.name}",
                    fontSize = 14.sp
                )
                Text(
                    text = "Provider: ${selectedProvider.name}",
                    fontSize = 14.sp
                )
                Text(
                    text = "Price: ${selectedCategory.basePrice} AED",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = ClutchRed
                )
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Date Selection
        Text(
            text = "Select Date",
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(modifier = Modifier.height(8.dp))
        
        // Simple date picker (in a real app, you'd use a proper date picker)
        LazyColumn {
            items(7) { index ->
                val date = LocalDate.now().plusDays(index + 1L)
                val isSelected = selectedDate == date
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { selectedDate = date },
                    colors = CardDefaults.cardColors(
                        containerColor = if (isSelected) ClutchRed else Color.White
                    )
                ) {
                    Text(
                        text = date.format(DateTimeFormatter.ofPattern("EEEE, MMM dd, yyyy")),
                        modifier = Modifier.padding(16.dp),
                        color = if (isSelected) Color.White else Color.Black
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Time Selection
        Text(
            text = "Select Time",
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(modifier = Modifier.height(8.dp))
        
        val timeSlots = listOf("09:00", "10:00", "11:00", "14:00", "15:00", "16:00")
        LazyColumn {
            items(timeSlots) { time ->
                val isSelected = selectedTime == time
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { selectedTime = time },
                    colors = CardDefaults.cardColors(
                        containerColor = if (isSelected) ClutchRed else Color.White
                    )
                ) {
                    Text(
                        text = time,
                        modifier = Modifier.padding(16.dp),
                        color = if (isSelected) Color.White else Color.Black
                    )
                }
            }
        }
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = { onDateTimeSelected(selectedDate.toString(), selectedTime) },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = ClutchRed)
        ) {
            Text("Continue", color = Color.White)
        }
    }
}

// Booking Confirmation Step
@Composable
fun BookingConfirmation(
    selectedCategory: ServiceCategory,
    selectedProvider: ServiceProvider,
    selectedDate: String,
    selectedTime: String,
    bookingNotes: String,
    onNotesChanged: (String) -> Unit,
    onConfirmBooking: () -> Unit,
    onBack: () -> Unit,
    isLoading: Boolean
) {
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
            }
            Text(
                text = "Confirm Booking",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Booking Details
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(containerColor = Color.White)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "Booking Details",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(modifier = Modifier.height(12.dp))
                
                BookingDetailRow("Service", selectedCategory.name)
                BookingDetailRow("Provider", selectedProvider.name)
                BookingDetailRow("Date", selectedDate)
                BookingDetailRow("Time", selectedTime)
                BookingDetailRow("Price", "${selectedCategory.basePrice} AED")
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        // Notes
        Text(
            text = "Additional Notes (Optional)",
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold
        )
        Spacer(modifier = Modifier.height(8.dp))
        
        OutlinedTextField(
            value = bookingNotes,
            onValueChange = onNotesChanged,
            placeholder = { Text("Any special requirements or notes...") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3,
            maxLines = 5
        )
        
        Spacer(modifier = Modifier.height(24.dp))
        
        Button(
            onClick = onConfirmBooking,
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
            enabled = !isLoading
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = Color.White
                )
            } else {
                Text("Confirm Booking", color = Color.White)
            }
        }
    }
}

@Composable
fun BookingDetailRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            fontSize = 14.sp,
            color = Color.Gray
        )
        Text(
            text = value,
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold
        )
    }
}
