package com.clutch.app.ui.screens.services

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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TimeSlotModal(
    onDismiss: () -> Unit,
    onTimeSlotSelected: (String) -> Unit
) {
    var selectedDate by remember { mutableStateOf("Today") }
    var showDatePicker by remember { mutableStateOf(false) }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.5f))
            .clickable { onDismiss() }
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 100.dp)
                .align(Alignment.BottomCenter),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp),
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
                        text = "Choose a time slot",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = Color.Gray,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Time Slots List
                LazyColumn(
                    modifier = Modifier.height(400.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(getTimeSlots()) { timeSlot ->
                        TimeSlotItem(
                            timeSlot = timeSlot,
                            isSelected = selectedDate == timeSlot.date,
                            onClick = {
                                selectedDate = timeSlot.date
                                onTimeSlotSelected(timeSlot.timeSlot)
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun TimeSlotItem(
    timeSlot: TimeSlot,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) ClutchRed.copy(alpha = 0.1f) else Color.White
        ),
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isSelected) 4.dp else 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = timeSlot.date,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                color = if (isSelected) ClutchRed else Color.Black
            )
            
            Icon(
                imageVector = Icons.Default.KeyboardArrowDown,
                contentDescription = "Dropdown",
                tint = if (isSelected) ClutchRed else Color.Gray,
                modifier = Modifier.size(20.dp)
            )
        }
        
        if (isSelected) {
            HorizontalDivider(
                color = ClutchRed,
                thickness = 2.dp,
                modifier = Modifier.padding(horizontal = 16.dp)
            )
        }
    }
}

// Data classes
data class TimeSlot(
    val date: String,
    val timeSlot: String
)

fun getTimeSlots(): List<TimeSlot> {
    return listOf(
        TimeSlot("Today", "9:00 AM - 10:00 PM"),
        TimeSlot("Today", "10:00 AM - 11:00 PM"),
        TimeSlot("Today", "11:00 AM - 12:00 PM"),
        TimeSlot("Today", "12:00 PM - 1:00 PM"),
        TimeSlot("Today", "1:00 PM - 2:00 PM"),
        TimeSlot("Today", "2:00 PM - 3:00 PM"),
        TimeSlot("Today", "3:00 PM - 4:00 PM"),
        TimeSlot("Today", "4:00 PM - 5:00 PM"),
        TimeSlot("Today", "5:00 PM - 6:00 PM"),
        TimeSlot("Today", "6:00 PM - 7:00 PM")
    )
}
