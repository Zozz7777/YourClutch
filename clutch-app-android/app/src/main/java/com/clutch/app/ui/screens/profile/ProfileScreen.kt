package com.clutch.app.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * ProfileScreen.kt - User profile management
 * 
 * Complete profile screen with user information,
 * avatar management, and profile settings.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    onNavigateBack: () -> Unit = {},
    onEditProfile: () -> Unit = {},
    onChangeAvatar: () -> Unit = {},
    onNavigateToSettings: () -> Unit = {}
) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(ClutchLayoutSpacing.screenPadding),
        verticalArrangement = Arrangement.spacedBy(ClutchSpacing.lg)
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
                    text = "Profile",
                    style = MaterialTheme.typography.headlineMedium
                )
                IconButton(onClick = onNavigateToSettings) {
                    Icon(
                        imageVector = Icons.Default.Settings,
                        contentDescription = "Settings"
                    )
                }
            }
        }

        item {
            // Profile Header
            ClutchCardBasic {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(ClutchComponentSpacing.cardPadding),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Avatar
                    Box(
                        modifier = Modifier
                            .size(120.dp)
                            .clip(CircleShape)
                            .background(MaterialTheme.colorScheme.primaryContainer)
                            .clickable { onChangeAvatar() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "Profile Picture",
                            modifier = Modifier.size(60.dp),
                            tint = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.md))
                    
                    // Name
                    Text(
                        text = "John Doe",
                        style = MaterialTheme.typography.headlineSmall
                    )
                    
                    // Email
                    Text(
                        text = "john.doe@example.com",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.md))
                    
                    // Edit Profile Button
                    ClutchButtonPrimary(
                        onClick = onEditProfile,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(ClutchSpacing.sm))
                        Text("Edit Profile")
                    }
                }
            }
        }

        item {
            // Personal Information
            ProfileSection(
                title = "Personal Information",
                items = listOf(
                    ProfileItem(
                        icon = Icons.Default.Person,
                        label = "Full Name",
                        value = "John Doe",
                        onClick = onEditProfile
                    ),
                    ProfileItem(
                        icon = Icons.Default.Email,
                        label = "Email",
                        value = "john.doe@example.com",
                        onClick = onEditProfile
                    ),
                    ProfileItem(
                        icon = Icons.Default.Phone,
                        label = "Phone",
                        value = "+1 (555) 123-4567",
                        onClick = onEditProfile
                    ),
                    ProfileItem(
                        icon = Icons.Default.LocationOn,
                        label = "Location",
                        value = "New York, NY",
                        onClick = onEditProfile
                    )
                )
            )
        }

        item {
            // Account Information
            ProfileSection(
                title = "Account Information",
                items = listOf(
                    ProfileItem(
                        icon = Icons.Default.DateRange,
                        label = "Member Since",
                        value = "January 2024",
                        onClick = null
                    ),
                    ProfileItem(
                        icon = Icons.Default.Star,
                        label = "Loyalty Points",
                        value = "2,450 points",
                        onClick = { /* Navigate to loyalty screen */ }
                    ),
                    ProfileItem(
                        icon = Icons.Default.CarRepair,
                        label = "Cars Registered",
                        value = "2 cars",
                        onClick = { /* Navigate to cars screen */ }
                    ),
                    ProfileItem(
                        icon = Icons.Default.History,
                        label = "Services Completed",
                        value = "15 services",
                        onClick = { /* Navigate to service history */ }
                    )
                )
            )
        }

        item {
            // Preferences
            ProfileSection(
                title = "Preferences",
                items = listOf(
                    ProfileItem(
                        icon = Icons.Default.Notifications,
                        label = "Notifications",
                        value = "Enabled",
                        onClick = { /* Navigate to notifications settings */ }
                    ),
                    ProfileItem(
                        icon = Icons.Default.Language,
                        label = "Language",
                        value = "English",
                        onClick = { /* Navigate to language settings */ }
                    ),
                    ProfileItem(
                        icon = Icons.Default.Palette,
                        label = "Theme",
                        value = "Light",
                        onClick = { /* Navigate to theme settings */ }
                    )
                )
            )
        }
    }
}

@Composable
private fun ProfileSection(
    title: String,
    items: List<ProfileItem>
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(ClutchSpacing.sm)
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(horizontal = ClutchSpacing.md)
        )
        
        ClutchCardBasic {
            Column {
                items.forEachIndexed { index, item ->
                    ProfileItemRow(
                        item = item,
                        showDivider = index < items.size - 1
                    )
                }
            }
        }
    }
}

@Composable
private fun ProfileItemRow(
    item: ProfileItem,
    showDivider: Boolean = true
) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .then(
                    if (item.onClick != null) {
                        Modifier.clickable { item.onClick!!() }
                    } else {
                        Modifier
                    }
                )
                .padding(ClutchComponentSpacing.listItemPadding),
            horizontalArrangement = Arrangement.spacedBy(ClutchSpacing.md),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(24.dp)
            )
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = item.label,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = item.value,
                    style = MaterialTheme.typography.bodyLarge
                )
            }
            
            if (item.onClick != null) {
                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = "Navigate",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
        
        if (showDivider) {
            HorizontalDivider(
                modifier = Modifier.padding(horizontal = ClutchSpacing.md),
                color = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
            )
        }
    }
}

data class ProfileItem(
    val icon: ImageVector,
    val label: String,
    val value: String,
    val onClick: (() -> Unit)?
)
