package com.clutch.app.ui.screens.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RatingScreen(
    onNavigateBack: () -> Unit = {}
) {
    var selectedRating by remember { mutableStateOf(0) }
    var showRatingDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(ClutchLayoutSpacing.screenPadding),
        verticalArrangement = Arrangement.spacedBy(ClutchSpacing.md)
    ) {
        item {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onNavigateBack) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back"
                    )
                }
                Text(
                    text = "Rate App",
                    style = MaterialTheme.typography.headlineMedium
                )
                Spacer(modifier = Modifier.size(48.dp))
            }
        }

        item {
            // Rating Overview
            ClutchCardBasic {
                Column(
                    modifier = Modifier.padding(ClutchSpacing.md),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "How would you rate Clutch?",
                        style = MaterialTheme.typography.titleMedium,
                        color = ClutchColors.primary
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.md))
                    
                    // Star Rating
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        repeat(5) { index ->
                            IconButton(
                                onClick = { selectedRating = index + 1 }
                            ) {
                                Icon(
                                    imageVector = if (index < selectedRating) Icons.Default.Star else Icons.Default.StarBorder,
                                    contentDescription = "Star ${index + 1}",
                                    tint = if (index < selectedRating) ClutchRed else ClutchColors.mutedForeground,
                                    modifier = Modifier.size(32.dp)
                                )
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.md))
                    
                    Text(
                        text = when (selectedRating) {
                            0 -> "Tap a star to rate"
                            1 -> "Poor"
                            2 -> "Fair"
                            3 -> "Good"
                            4 -> "Very Good"
                            5 -> "Excellent"
                            else -> ""
                        },
                        style = MaterialTheme.typography.bodyLarge,
                        color = ClutchColors.mutedForeground
                    )
                }
            }
        }

        item {
            // Rating Actions
            ClutchCardBasic {
                Column(
                    modifier = Modifier.padding(ClutchSpacing.md)
                ) {
                    Text(
                        text = "Rate on App Store",
                        style = MaterialTheme.typography.titleMedium,
                        color = ClutchColors.primary
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    Text(
                        text = "Help others discover Clutch by rating us on the App Store",
                        style = MaterialTheme.typography.bodyMedium,
                        color = ClutchColors.mutedForeground
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.md))
                    
                    Button(
                        onClick = { /* Open App Store rating */ },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Star, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Rate on App Store")
                    }
                }
            }
        }

        item {
            // Feedback
            ClutchCardBasic {
                Column(
                    modifier = Modifier.padding(ClutchSpacing.md)
                ) {
                    Text(
                        text = "Additional Feedback",
                        style = MaterialTheme.typography.titleMedium,
                        color = ClutchColors.primary
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    Text(
                        text = "Have suggestions for improvement? We'd love to hear from you!",
                        style = MaterialTheme.typography.bodyMedium,
                        color = ClutchColors.mutedForeground
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.md))
                    
                    OutlinedButton(
                        onClick = { /* Navigate to feedback */ },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Feedback, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Send Feedback")
                    }
                }
            }
        }
    }
}
