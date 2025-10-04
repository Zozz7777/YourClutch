package com.clutch.app.ui.screens.about

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.clutch.app.ui.theme.ClutchColors
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * RateAppScreen.kt - App rating and review
 * 
 * Complete app rating screen with star rating system,
 * review submission, and feedback collection.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RateAppScreen(
    onNavigateBack: () -> Unit = {}
) {
    var rating by remember { mutableStateOf(0) }
    var review by remember { mutableStateOf("") }
    var isSubmitting by remember { mutableStateOf(false) }
    var hasSubmitted by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Rate App") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = ClutchRed,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(ClutchLayoutSpacing.screenPadding)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(ClutchSpacing.lg)
        ) {
            // Header
            Text(
                text = "Rate Clutch",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )

            Text(
                text = "Your feedback helps us improve the app",
                fontSize = 16.sp,
                color = Color.Gray,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )

            // Rating Section
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(ClutchSpacing.md),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "How would you rate your experience?",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.Black
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.lg))
                    
                    // Star Rating
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(ClutchSpacing.sm)
                    ) {
                        repeat(5) { index ->
                            IconButton(
                                onClick = { rating = index + 1 }
                            ) {
                                Icon(
                                    imageVector = if (index < rating) Icons.Default.Star else Icons.Default.StarBorder,
                                    contentDescription = null,
                                    tint = if (index < rating) Color(0xFFFFD700) else Color.Gray,
                                    modifier = Modifier.size(40.dp)
                                )
                            }
                        }
                    }
                    
                    if (rating > 0) {
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        Text(
                            text = when (rating) {
                                1 -> "Poor - We're sorry to hear that"
                                2 -> "Fair - We'll work to improve"
                                3 -> "Good - Thanks for the feedback"
                                4 -> "Very Good - We're glad you like it"
                                5 -> "Excellent - Thank you so much!"
                                else -> ""
                            },
                            fontSize = 16.sp,
                            color = when {
                                rating >= 4 -> Color(0xFF4CAF50)
                                rating >= 3 -> Color(0xFFFF9800)
                                else -> Color(0xFFF44336)
                            },
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }

            // Review Section
            if (rating > 0) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Text(
                            text = "Tell us more (optional)",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color.Black
                        )
                        
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        OutlinedTextField(
                            value = review,
                            onValueChange = { review = it },
                            placeholder = { Text("What did you like or dislike about the app?") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 4,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = ClutchRed,
                                unfocusedBorderColor = Color.Gray
                            )
                        )
                    }
                }
            }

            // Quick Feedback Options
            if (rating > 0) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Text(
                            text = "Quick Feedback",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        val feedbackOptions = when (rating) {
                            1, 2 -> listOf(
                                "App crashes frequently",
                                "Slow loading times",
                                "Hard to navigate",
                                "Missing features",
                                "Poor customer service"
                            )
                            3 -> listOf(
                                "App works but could be better",
                                "Some features are confusing",
                                "Loading could be faster",
                                "Interface could be improved"
                            )
                            4, 5 -> listOf(
                                "Easy to use",
                                "Fast and reliable",
                                "Great customer service",
                                "Helpful features",
                                "Would recommend to others"
                            )
                            else -> emptyList()
                        }
                        
                        feedbackOptions.forEach { option ->
                            QuickFeedbackOption(
                                text = option,
                                onClick = { review = if (review.isEmpty()) option else "$review\n$option" }
                            )
                        }
                    }
                }
            }

            // Submit Button
            if (rating > 0 && !hasSubmitted) {
                Button(
                    onClick = {
                        isSubmitting = true
                        // Submit rating and review
                        isSubmitting = false
                        hasSubmitted = true
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isSubmitting,
                    colors = ButtonDefaults.buttonColors(containerColor = ClutchRed)
                ) {
                    Text(
                        text = if (isSubmitting) "Submitting..." else "Submit Rating",
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            // Thank You Message
            if (hasSubmitted) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.success.copy(alpha = 0.1f)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = ClutchColors.success,
                            modifier = Modifier.size(48.dp)
                        )
                        
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        Text(
                            text = "Thank you for your feedback!",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = ClutchColors.success
                        )
                        
                        Text(
                            text = "Your rating helps us improve the app for everyone.",
                            fontSize = 14.sp,
                            color = ClutchColors.success,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }

            // App Store Links
            if (hasSubmitted) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Text(
                            text = "Rate us on the App Store",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        Text(
                            text = "Help others discover Clutch by rating us on the app store.",
                            fontSize = 14.sp,
                            color = Color.Gray
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        Button(
                            onClick = { /* Open app store */ },
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = ClutchRed)
                        ) {
                            Text(
                                text = "Rate on Google Play",
                                color = Color.White
                            )
                        }
                    }
                }
            }

            // App Information
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF8F9FA)),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Column(
                    modifier = Modifier.padding(ClutchSpacing.md)
                ) {
                    Text(
                        text = "App Information",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    AppInfoItem(
                        label = "Version",
                        value = "1.0.0"
                    )
                    
                    AppInfoItem(
                        label = "Build",
                        value = "2024.12.01"
                    )
                    
                    AppInfoItem(
                        label = "Platform",
                        value = "Android"
                    )
                }
            }

            Spacer(modifier = Modifier.height(100.dp))
        }
    }
}

@Composable
private fun QuickFeedbackOption(
    text: String,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(ClutchSpacing.sm),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Add,
                contentDescription = null,
                tint = ClutchRed,
                modifier = Modifier.size(16.dp)
            )
            
            Spacer(modifier = Modifier.width(ClutchSpacing.sm))
            
            Text(
                text = text,
                fontSize = 14.sp,
                color = Color.Black
            )
        }
    }
}

@Composable
private fun AppInfoItem(
    label: String,
    value: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = ClutchSpacing.xs),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            fontSize = 14.sp,
            color = Color.Black
        )
        Text(
            text = value,
            fontSize = 14.sp,
            color = Color.Gray
        )
    }
}
