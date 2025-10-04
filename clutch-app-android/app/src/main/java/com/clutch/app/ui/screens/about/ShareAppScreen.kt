package com.clutch.app.ui.screens.about

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
 * ShareAppScreen.kt - Share app with friends and family
 * 
 * Complete share app screen with sharing options, referral system,
 * and social media integration.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShareAppScreen(
    onNavigateBack: () -> Unit = {}
) {
    var selectedMessage by remember { mutableStateOf("") }
    var referralCode by remember { mutableStateOf("CLUTCH2024") }
    var customMessage by remember { mutableStateOf("") }

    val shareMessages = listOf(
        ShareMessage(
            id = "default",
            title = "Default Message",
            message = "Check out Clutch - the best app for car maintenance and services! Download it now: https://clutch.com/app"
        ),
        ShareMessage(
            id = "friendly",
            title = "Friendly",
            message = "Hey! I've been using this amazing app called Clutch for my car maintenance. It's super helpful - you should try it! https://clutch.com/app"
        ),
        ShareMessage(
            id = "professional",
            title = "Professional",
            message = "I recommend Clutch for automotive services and maintenance management. It's a comprehensive platform for car owners. https://clutch.com/app"
        ),
        ShareMessage(
            id = "casual",
            title = "Casual",
            message = "Found this cool car app called Clutch. Makes managing my car maintenance so much easier! https://clutch.com/app"
        )
    )

    val shareOptions = listOf(
        ShareOption(
            name = "WhatsApp",
            icon = Icons.Default.Chat,
            color = Color(0xFF25D366)
        ),
        ShareOption(
            name = "Facebook",
            icon = Icons.Default.Share,
            color = Color(0xFF1877F2)
        ),
        ShareOption(
            name = "Twitter",
            icon = Icons.Default.Share,
            color = Color(0xFF1DA1F2)
        ),
        ShareOption(
            name = "Instagram",
            icon = Icons.Default.Share,
            color = Color(0xFFE4405F)
        ),
        ShareOption(
            name = "Email",
            icon = Icons.Default.Email,
            color = Color(0xFFEA4335)
        ),
        ShareOption(
            name = "SMS",
            icon = Icons.Default.Sms,
            color = Color(0xFF34A853)
        ),
        ShareOption(
            name = "Copy Link",
            icon = Icons.Default.ContentCopy,
            color = Color(0xFF9C27B0)
        ),
        ShareOption(
            name = "More",
            icon = Icons.Default.MoreVert,
            color = Color(0xFF607D8B)
        )
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Share App") },
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
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(ClutchLayoutSpacing.screenPadding),
            verticalArrangement = Arrangement.spacedBy(ClutchSpacing.lg)
        ) {
            item {
                // Header
                Text(
                    text = "Share Clutch",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
                
                Text(
                    text = "Help your friends discover the best car maintenance app",
                    fontSize = 16.sp,
                    color = Color.Gray
                )
            }

            // Referral Code Section
            item {
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
                            imageVector = Icons.Default.CardGiftcard,
                            contentDescription = null,
                            tint = ClutchColors.success,
                            modifier = Modifier.size(32.dp)
                        )
                        
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        Text(
                            text = "Your Referral Code",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = ClutchColors.success
                        )
                        
                        Text(
                            text = referralCode,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = ClutchColors.success
                        )
                        
                        Text(
                            text = "Share this code with friends and earn rewards!",
                            fontSize = 14.sp,
                            color = ClutchColors.success,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }

            // Message Templates
            item {
                Text(
                    text = "Choose a Message",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black
                )
            }

            items(shareMessages) { message ->
                ShareMessageCard(
                    message = message,
                    isSelected = selectedMessage == message.id,
                    onSelect = { selectedMessage = message.id }
                )
            }

            // Custom Message
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Text(
                            text = "Custom Message",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color.Black
                        )
                        
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        OutlinedTextField(
                            value = customMessage,
                            onValueChange = { customMessage = it },
                            placeholder = { Text("Write your own message...") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 3,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = ClutchRed,
                                unfocusedBorderColor = Color.Gray
                            )
                        )
                    }
                }
            }

            // Share Options
            item {
                Text(
                    text = "Share Via",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black
                )
            }

            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(ClutchSpacing.sm)
                ) {
                    items(shareOptions) { option ->
                        ShareOptionCard(
                            option = option,
                            onClick = { 
                                // Placeholder implementation - will be replaced with actual sharing
                                // TODO: Implement sharing functionality
                                when (option.name) {
                                    "WhatsApp" -> { /* TODO: Implement WhatsApp sharing */ }
                                    "Facebook" -> { /* TODO: Implement Facebook sharing */ }
                                    "Twitter" -> { /* TODO: Implement Twitter sharing */ }
                                    "Instagram" -> { /* TODO: Implement Instagram sharing */ }
                                    "Email" -> { /* TODO: Implement Email sharing */ }
                                    "SMS" -> { /* TODO: Implement SMS sharing */ }
                                    "Copy Link" -> { /* TODO: Implement copy to clipboard */ }
                                    "More" -> { /* TODO: Implement generic sharing */ }
                                }
                            }
                        )
                    }
                }
            }

            // App Features
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Text(
                            text = "Why Share Clutch?",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        AppFeature(
                            icon = Icons.Default.Build,
                            title = "Expert Service Booking",
                            description = "Book maintenance with certified professionals"
                        )
                        
                        AppFeature(
                            icon = Icons.Default.ShoppingCart,
                            title = "Quality Parts",
                            description = "Order genuine car parts with fast delivery"
                        )
                        
                        AppFeature(
                            icon = Icons.Default.TrackChanges,
                            title = "Maintenance Tracking",
                            description = "Never miss important service reminders"
                        )
                        
                        AppFeature(
                            icon = Icons.Default.Group,
                            title = "Community Support",
                            description = "Get help from fellow car enthusiasts"
                        )
                    }
                }
            }

            // Rewards Information
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.primary.copy(alpha = 0.1f)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = null,
                                tint = ClutchColors.primary,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(ClutchSpacing.sm))
                            Text(
                                text = "Earn Rewards",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = ClutchColors.primary
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        Text(
                            text = "Get 100 points for each friend who signs up with your referral code. Use points for discounts on services and parts!",
                            fontSize = 14.sp,
                            color = Color(0xFF0D47A1),
                            lineHeight = 20.sp
                        )
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(100.dp))
            }
        }
    }
}

@Composable
private fun ShareMessageCard(
    message: ShareMessage,
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
                    text = message.title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (isSelected) ClutchRed else Color.Black
                )
                Text(
                    text = message.message,
                    fontSize = 14.sp,
                    color = Color.Gray,
                    maxLines = 2
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
private fun ShareOptionCard(
    option: ShareOption,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .size(80.dp)
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(ClutchSpacing.sm),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = option.icon,
                contentDescription = null,
                tint = option.color,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.height(ClutchSpacing.xs))
            
            Text(
                text = option.name,
                fontSize = 10.sp,
                color = Color.Black,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
private fun AppFeature(
    icon: ImageVector,
    title: String,
    description: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = ClutchSpacing.xs),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = ClutchRed,
            modifier = Modifier.size(20.dp)
        )
        
        Spacer(modifier = Modifier.width(ClutchSpacing.sm))
        
        Column {
            Text(
                text = title,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            Text(
                text = description,
                fontSize = 12.sp,
                color = Color.Gray
            )
        }
    }
}

data class ShareMessage(
    val id: String,
    val title: String,
    val message: String
)

data class ShareOption(
    val name: String,
    val icon: ImageVector,
    val color: Color
)
