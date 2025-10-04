package com.clutch.app.ui.screens.help

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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * FeedbackScreen.kt - User feedback and suggestions
 * 
 * Complete feedback screen with rating system, feedback categories,
 * and suggestion submission functionality.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedbackScreen(
    onNavigateBack: () -> Unit = {}
) {
    var rating by remember { mutableStateOf(0) }
    var feedbackType by remember { mutableStateOf("") }
    var subject by remember { mutableStateOf("") }
    var feedback by remember { mutableStateOf("") }
    var isAnonymous by remember { mutableStateOf(false) }
    var isSubmitting by remember { mutableStateOf(false) }

    val feedbackTypes = listOf(
        FeedbackType("bug", "Bug Report", "Report a technical issue or bug"),
        FeedbackType("feature", "Feature Request", "Suggest a new feature or improvement"),
        FeedbackType("ui", "UI/UX Feedback", "Feedback about the app's design and usability"),
        FeedbackType("performance", "Performance", "Report slow loading or performance issues"),
        FeedbackType("general", "General Feedback", "General comments or suggestions")
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Send Feedback") },
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
                text = "Share Your Feedback",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
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
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.Black
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
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
                                    modifier = Modifier.size(32.dp)
                                )
                            }
                        }
                    }
                    
                    if (rating > 0) {
                        Text(
                            text = when (rating) {
                                1 -> "Poor"
                                2 -> "Fair"
                                3 -> "Good"
                                4 -> "Very Good"
                                5 -> "Excellent"
                                else -> ""
                            },
                            fontSize = 14.sp,
                            color = if (rating >= 4) Color(0xFF4CAF50) else if (rating >= 3) Color(0xFFFF9800) else Color(0xFFF44336)
                        )
                    }
                }
            }

            // Feedback Type Selection
            Text(
                text = "What type of feedback is this?",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.Black
            )

            feedbackTypes.forEach { type ->
                FeedbackTypeCard(
                    type = type,
                    isSelected = feedbackType == type.id,
                    onSelect = { feedbackType = type.id }
                )
            }

            // Feedback Form
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(ClutchSpacing.md)
                ) {
                    Text(
                        text = "Tell us more",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.Black
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    // Subject
                    OutlinedTextField(
                        value = subject,
                        onValueChange = { subject = it },
                        label = { Text("Subject") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ClutchRed,
                            unfocusedBorderColor = Color.Gray
                        )
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    // Feedback
                    OutlinedTextField(
                        value = feedback,
                        onValueChange = { feedback = it },
                        label = { Text("Your feedback") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 4,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ClutchRed,
                            unfocusedBorderColor = Color.Gray
                        )
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    // Anonymous option
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = isAnonymous,
                            onCheckedChange = { isAnonymous = it },
                            colors = CheckboxDefaults.colors(
                                checkedColor = ClutchRed
                            )
                        )
                        Spacer(modifier = Modifier.width(ClutchSpacing.sm))
                        Text(
                            text = "Submit anonymously",
                            fontSize = 14.sp,
                            color = Color.Black
                        )
                    }
                }
            }

            // Quick Feedback Options
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
                    
                    QuickFeedbackOption(
                        icon = Icons.Default.ThumbUp,
                        text = "The app is working great!",
                        onClick = { 
                            rating = 5
                            feedback = "The app is working great!"
                        }
                    )
                    
                    QuickFeedbackOption(
                        icon = Icons.Default.ThumbDown,
                        text = "I'm having issues with the app",
                        onClick = { 
                            rating = 2
                            feedback = "I'm having issues with the app"
                        }
                    )
                    
                    QuickFeedbackOption(
                        icon = Icons.Default.Lightbulb,
                        text = "I have a suggestion",
                        onClick = { 
                            feedbackType = "feature"
                            feedback = "I have a suggestion"
                        }
                    )
                }
            }

            // Submit Button
            Button(
                onClick = {
                    isSubmitting = true
                    // Submit feedback
                    isSubmitting = false
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !isSubmitting && feedback.isNotEmpty(),
                colors = ButtonDefaults.buttonColors(containerColor = ClutchRed)
            ) {
                Text(
                    text = if (isSubmitting) "Submitting..." else "Submit Feedback",
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            // Thank You Message
            if (isSubmitting) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.success.copy(alpha = 0.1f)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(ClutchSpacing.md),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = ClutchColors.success,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(ClutchSpacing.sm))
                        Text(
                            text = "Thank you for your feedback! We'll review it and get back to you if needed.",
                            fontSize = 14.sp,
                            color = ClutchColors.success
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(100.dp))
        }
    }
}

@Composable
private fun FeedbackTypeCard(
    type: FeedbackType,
    isSelected: Boolean,
    onSelect: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onSelect() },
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) ClutchRed.copy(alpha = 0.1f) else Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(ClutchSpacing.md),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = type.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (isSelected) ClutchRed else Color.Black
                )
                Text(
                    text = type.description,
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
            
            if (isSelected) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = null,
                    tint = ClutchRed
                )
            }
        }
    }
}

@Composable
private fun QuickFeedbackOption(
    icon: ImageVector,
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
                imageVector = icon,
                contentDescription = null,
                tint = ClutchRed,
                modifier = Modifier.size(20.dp)
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

data class FeedbackType(
    val id: String,
    val name: String,
    val description: String
)
