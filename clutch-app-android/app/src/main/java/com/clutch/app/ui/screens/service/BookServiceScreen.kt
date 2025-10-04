package com.clutch.app.ui.screens.service

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.hilt.navigation.compose.hiltViewModel
import com.clutch.app.ui.theme.ClutchAppTheme
import com.clutch.app.ui.theme.ClutchRed
import com.clutch.app.data.model.ServiceCategory
import com.clutch.app.data.model.ServiceProvider
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BookServiceScreen(
    onBookService: (String) -> Unit = {},
    viewModel: BookServiceViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    // Handle booking success
    LaunchedEffect(uiState.isBookingSuccess) {
        if (uiState.isBookingSuccess) {
            onBookService("booking_success")
            viewModel.resetBooking()
        }
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Book Service",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = ClutchRed
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFFF0F2F5))
                .padding(16.dp)
        ) {
            // Show error message if any
            if (uiState.errorMessage.isNotEmpty()) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE)),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Error,
                            contentDescription = "Error",
                            tint = Color.Red
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = uiState.errorMessage,
                            color = Color.Red,
                            fontSize = 14.sp
                        )
                        Spacer(modifier = Modifier.weight(1f))
                        TextButton(onClick = { viewModel.clearError() }) {
                            Text("Dismiss", color = Color.Red)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }
            
            when {
                uiState.selectedCategory == null -> {
                    // Step 1: Select Service Category
                    ServiceCategorySelection(
                        categories = uiState.serviceCategories,
                        isLoading = uiState.isLoading,
                        onCategorySelected = { category -> 
                            viewModel.selectServiceCategory(category)
                        }
                    )
                }
                uiState.selectedProvider == null -> {
                    // Step 2: Select Service Provider
                    ServiceProviderSelection(
                        providers = uiState.serviceProviders,
                        isLoading = uiState.isLoading,
                        onProviderSelected = { provider ->
                            viewModel.selectServiceProvider(provider)
                        },
                        onBack = { viewModel.resetBooking() }
                    )
                }
                uiState.selectedDate == null || uiState.selectedTime == null -> {
                    // Step 3: Select Date and Time
                    DateTimeSelection(
                        selectedCategory = uiState.selectedCategory!!,
                        selectedProvider = uiState.selectedProvider!!,
                        onDateTimeSelected = { date, time ->
                            viewModel.selectDateTime(date, time)
                        },
                        onBack = { 
                            viewModel.resetBooking()
                        }
                    )
                }
                else -> {
                    // Step 4: Booking Summary and Confirmation
                    BookingConfirmation(
                        selectedCategory = uiState.selectedCategory!!,
                        selectedProvider = uiState.selectedProvider!!,
                        selectedDate = uiState.selectedDate!!,
                        selectedTime = uiState.selectedTime!!,
                        bookingNotes = uiState.bookingNotes,
                        onNotesChanged = { notes -> viewModel.updateBookingNotes(notes) },
                        onConfirmBooking = { viewModel.bookService() },
                        onBack = { 
                            viewModel.selectDateTime("", "")
                        },
                        isLoading = uiState.isLoading
                    )
                }
            }
        }
    }
}

@Composable
fun ServiceCategoryCard(
    name: String,
    description: String,
    price: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    serviceId: String = "",
    onBookService: (String) -> Unit = {}
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
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
                    imageVector = icon,
                    contentDescription = name,
                    tint = ClutchRed,
                    modifier = Modifier.size(32.dp)
                )
                Spacer(modifier = Modifier.width(16.dp))
                Column {
                    Text(
                        text = name,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                    Text(
                        text = description,
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = price,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = ClutchRed
                )
                Button(
                    onClick = { onBookService(serviceId) },
                    colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text("Book", color = Color.White, fontSize = 12.sp)
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun BookServiceScreenPreview() {
    ClutchAppTheme {
        BookServiceScreen()
    }
}
