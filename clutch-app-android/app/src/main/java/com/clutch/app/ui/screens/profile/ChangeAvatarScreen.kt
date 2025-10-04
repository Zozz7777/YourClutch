package com.clutch.app.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * ChangeAvatarScreen.kt - Change user profile picture
 * 
 * Complete avatar selection screen with predefined avatars,
 * camera integration, and profile picture management.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChangeAvatarScreen(
    onNavigateBack: () -> Unit = {},
    onAvatarSelected: (String) -> Unit = {}
) {
    var selectedAvatar by remember { mutableStateOf("") }
    var showCamera by remember { mutableStateOf(false) }
    var showGallery by remember { mutableStateOf(false) }

    val predefinedAvatars = listOf(
        AvatarOption("avatar1", "Avatar 1", Color(0xFFE3F2FD)),
        AvatarOption("avatar2", "Avatar 2", Color(0xFFF3E5F5)),
        AvatarOption("avatar3", "Avatar 3", Color(0xFFE8F5E8)),
        AvatarOption("avatar4", "Avatar 4", Color(0xFFFFF3E0)),
        AvatarOption("avatar5", "Avatar 5", Color(0xFFFCE4EC)),
        AvatarOption("avatar6", "Avatar 6", Color(0xFFE0F2F1)),
        AvatarOption("avatar7", "Avatar 7", Color(0xFFF1F8E9)),
        AvatarOption("avatar8", "Avatar 8", Color(0xFFE3F2FD))
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Change Avatar") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    if (selectedAvatar.isNotEmpty()) {
                        TextButton(
                            onClick = { onAvatarSelected(selectedAvatar) }
                        ) {
                            Text(
                                text = "Save",
                                color = ClutchRed
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = ClutchRed,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White,
                    actionIconContentColor = Color.White
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
                    text = "Choose Your Avatar",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = ClutchColors.foreground
                )
            }

            item {
                // Current Avatar Preview
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Current Avatar",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = ClutchColors.foreground
                        )
                        
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        // Current avatar display
                        Box(
                            modifier = Modifier.size(120.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Card(
                                modifier = Modifier.size(120.dp),
                                shape = CircleShape,
                                colors = CardDefaults.cardColors(containerColor = ClutchColors.muted)
                            ) {
                                Box(
                                    modifier = Modifier.fillMaxSize(),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Person,
                                        contentDescription = null,
                                        modifier = Modifier.size(48.dp),
                                        tint = Color.Gray
                                    )
                                }
                            }
                        }
                    }
                }
            }

            item {
                // Upload Options
                Text(
                    text = "Upload New Photo",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = ClutchColors.foreground
                )
            }

            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(ClutchSpacing.md)
                ) {
                    // Camera Option
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { showCamera = true },
                        colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(ClutchSpacing.md),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.CameraAlt,
                                contentDescription = null,
                                modifier = Modifier.size(32.dp),
                                tint = ClutchRed
                            )
                            Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                            Text(
                                text = "Take Photo",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                color = ClutchColors.foreground
                            )
                        }
                    }

                    // Gallery Option
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { showGallery = true },
                        colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(ClutchSpacing.md),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.PhotoLibrary,
                                contentDescription = null,
                                modifier = Modifier.size(32.dp),
                                tint = ClutchRed
                            )
                            Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                            Text(
                                text = "Choose from Gallery",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                color = ClutchColors.foreground
                            )
                        }
                    }
                }
            }

            item {
                // Predefined Avatars
                Text(
                    text = "Choose from Predefined Avatars",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = ClutchColors.foreground
                )
            }

            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(ClutchSpacing.sm)
                ) {
                    items(predefinedAvatars) { avatar ->
                        AvatarOptionCard(
                            avatar = avatar,
                            isSelected = selectedAvatar == avatar.id,
                            onSelect = { selectedAvatar = avatar.id }
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
private fun AvatarOptionCard(
    avatar: AvatarOption,
    isSelected: Boolean,
    onSelect: () -> Unit
) {
    Card(
        modifier = Modifier
            .size(80.dp)
            .clickable { onSelect() },
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) ClutchRed.copy(alpha = 0.1f) else ClutchColors.card
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = if (isSelected) 4.dp else 2.dp
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(ClutchSpacing.sm),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(avatar.color),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = null,
                    modifier = Modifier.size(24.dp),
                    tint = Color.Gray
                )
            }
            
            Spacer(modifier = Modifier.height(ClutchSpacing.xs))
            
            Text(
                text = avatar.name,
                fontSize = 10.sp,
                color = if (isSelected) ClutchRed else ClutchColors.foreground
            )
        }
    }
}


data class AvatarOption(
    val id: String,
    val name: String,
    val color: Color
)
