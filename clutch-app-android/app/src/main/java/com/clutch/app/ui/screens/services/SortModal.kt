package com.clutch.app.ui.screens.services

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
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

@Composable
fun SortModal(
    onDismiss: () -> Unit,
    onSortSelected: (String) -> Unit
) {
    var selectedSort by remember { mutableStateOf("") }
    
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.5f))
            .clickable { onDismiss() }
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 32.dp, vertical = 200.dp)
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
                        text = "Sort",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                    TextButton(
                        onClick = { 
                            selectedSort = ""
                            onSortSelected("")
                        }
                    ) {
                        Text(
                            text = "Reset",
                            fontSize = 16.sp,
                            color = ClutchRed,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Divider
                HorizontalDivider(
                    color = Color.LightGray,
                    thickness = 1.dp
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Sort Options
                SortOption(
                    title = "Highest Rating",
                    isSelected = selectedSort == "rating",
                    onClick = {
                        selectedSort = "rating"
                        onSortSelected("rating")
                    }
                )
                
                Spacer(modifier = Modifier.height(12.dp))
                
                SortOption(
                    title = "Short Waiting Time",
                    isSelected = selectedSort == "waiting_time",
                    onClick = {
                        selectedSort = "waiting_time"
                        onSortSelected("waiting_time")
                    }
                )
            }
        }
    }
}

@Composable
fun SortOption(
    title: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = if (isSelected) Icons.Default.RadioButtonChecked else Icons.Default.RadioButtonUnchecked,
            contentDescription = if (isSelected) "Selected" else "Unselected",
            tint = if (isSelected) ClutchRed else Color.Gray,
            modifier = Modifier.size(20.dp)
        )
        
        Spacer(modifier = Modifier.width(12.dp))
        
        Text(
            text = title,
            fontSize = 16.sp,
            color = Color.Black
        )
    }
}
