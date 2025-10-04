package com.clutch.app.ui.screens.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * SettingsScreen.kt - User settings and preferences
 * 
 * Complete settings screen with all user preferences,
 * app settings, and configuration options.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onNavigateBack: () -> Unit = {},
    onNavigateToProfile: () -> Unit = {},
    onNavigateToNotifications: () -> Unit = {},
    onNavigateToPrivacy: () -> Unit = {},
    onNavigateToAbout: () -> Unit = {},
    onNavigateToHelp: () -> Unit = {},
    onNavigateToLanguage: () -> Unit = {},
    onNavigateToTheme: () -> Unit = {},
    onNavigateToSecurity: () -> Unit = {},
    onNavigateToData: () -> Unit = {},
    onNavigateToWallet: () -> Unit = {},
    onNavigateToSavedAddresses: () -> Unit = {},
    onNavigateToCars: () -> Unit = {},
    onNavigateToStorage: () -> Unit = {},
    onNavigateToSync: () -> Unit = {},
    onNavigateToMaintenanceSettings: () -> Unit = {},
    onNavigateToMileageSettings: () -> Unit = {},
    onNavigateToFeedback: () -> Unit = {},
    onNavigateToRating: () -> Unit = {}
) {
    val context = LocalContext.current
    
    // Theme management
    val isDarkTheme = ThemeManager.isDarkTheme(context)
    val colors = if (isDarkTheme) ClutchDarkColors else ClutchColors
    
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
                        contentDescription = stringResource(R.string.back)
                    )
                }
                Text(
                    text = stringResource(R.string.settings),
                    style = MaterialTheme.typography.headlineMedium
                )
                Spacer(modifier = Modifier.size(48.dp))
            }
        }

        item {
            // Profile Section
            SettingsSection(
                title = stringResource(R.string.profile),
                items = listOf(
                    SettingsItem(
                        icon = Icons.Default.Person,
                        title = stringResource(R.string.personal_information),
                        subtitle = stringResource(R.string.manage_personal_details),
                        onClick = onNavigateToProfile
                    ),
                    SettingsItem(
                        icon = Icons.Default.Security,
                        title = stringResource(R.string.security),
                        subtitle = stringResource(R.string.password_2fa_security_settings),
                        onClick = onNavigateToSecurity
                    ),
                    SettingsItem(
                        icon = Icons.Default.AccountBalanceWallet,
                        title = stringResource(R.string.wallet),
                        subtitle = stringResource(R.string.manage_wallet_payment_methods),
                        onClick = onNavigateToWallet
                    ),
                    SettingsItem(
                        icon = Icons.Default.LocationOn,
                        title = "Saved Addresses",
                        subtitle = "Manage your delivery addresses",
                        onClick = onNavigateToSavedAddresses
                    )
                )
            )
        }

        item {
            // App Settings Section
            SettingsSection(
                title = "App Settings",
                items = listOf(
                    SettingsItem(
                        icon = Icons.Default.Notifications,
                        title = "Notifications",
                        subtitle = "Manage notification preferences",
                        onClick = onNavigateToNotifications
                    ),
                    SettingsItem(
                        icon = Icons.Default.Language,
                        title = "Language",
                        subtitle = "English",
                        onClick = onNavigateToLanguage
                    ),
                    SettingsItem(
                        icon = Icons.Default.Palette,
                        title = "Theme",
                        subtitle = "Light",
                        onClick = onNavigateToTheme
                    ),
                    SettingsItem(
                        icon = Icons.Default.Storage,
                        title = "Storage",
                        subtitle = "Manage app storage and cache",
                        onClick = onNavigateToStorage
                    ),
                    SettingsItem(
                        icon = Icons.Default.Sync,
                        title = "Sync Settings",
                        subtitle = "Manage data synchronization",
                        onClick = onNavigateToSync
                    )
                )
            )
        }

        item {
            // Privacy & Data Section
            SettingsSection(
                title = "Privacy & Data",
                items = listOf(
                    SettingsItem(
                        icon = Icons.Default.PrivacyTip,
                        title = "Privacy Policy",
                        subtitle = "How we protect your data",
                        onClick = onNavigateToPrivacy
                    ),
                    SettingsItem(
                        icon = Icons.Default.Storage,
                        title = "Data Management",
                        subtitle = "Export, delete, or manage your data",
                        onClick = onNavigateToData
                    )
                )
            )
        }

        item {
            // Vehicle Settings Section
            SettingsSection(
                title = "Vehicle Settings",
                items = listOf(
                    SettingsItem(
                        icon = Icons.Default.DirectionsCar,
                        title = "My Cars",
                        subtitle = "Manage your registered vehicles",
                        onClick = onNavigateToCars
                    ),
                    SettingsItem(
                        icon = Icons.Default.Settings,
                        title = "Maintenance Reminders",
                        subtitle = "Configure maintenance alerts",
                        onClick = onNavigateToMaintenanceSettings
                    ),
                    SettingsItem(
                        icon = Icons.Default.Speed,
                        title = "Mileage Tracking",
                        subtitle = "Manage mileage tracking preferences",
                        onClick = onNavigateToMileageSettings
                    )
                )
            )
        }

        item {
            // Support Section
            SettingsSection(
                title = "Support",
                items = listOf(
                    SettingsItem(
                        icon = Icons.Default.Help,
                        title = "Help & Support",
                        subtitle = "Get help and contact support",
                        onClick = onNavigateToHelp
                    ),
                    SettingsItem(
                        icon = Icons.Default.Info,
                        title = "About",
                        subtitle = "App version and information",
                        onClick = onNavigateToAbout
                    ),
                    SettingsItem(
                        icon = Icons.Default.Feedback,
                        title = "Send Feedback",
                        subtitle = "Share your thoughts and suggestions",
                        onClick = onNavigateToFeedback
                    ),
                    SettingsItem(
                        icon = Icons.Default.Star,
                        title = "Rate App",
                        subtitle = "Rate us on the app store",
                        onClick = onNavigateToRating
                    )
                )
            )
        }

        item {
            // App Version
            Text(
                text = "Version 1.0.0",
                style = MaterialTheme.typography.bodySmall,
                color = ClutchColors.mutedForeground,
                modifier = Modifier.padding(ClutchSpacing.md)
            )
        }
    }
}

@Composable
fun SettingsSection(
    title: String,
    items: List<SettingsItem>
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(ClutchSpacing.sm)
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            color = ClutchColors.primary,
            modifier = Modifier.padding(horizontal = ClutchSpacing.md)
        )
        
        ClutchCardBasic {
            Column {
                items.forEachIndexed { index, item ->
                    SettingsItemRow(
                        item = item,
                        showDivider = index < items.size - 1
                    )
                }
            }
        }
    }
}

@Composable
private fun SettingsItemRow(
    item: SettingsItem,
    showDivider: Boolean = true
) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clickable { item.onClick() }
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
                    text = item.title,
                    style = MaterialTheme.typography.bodyLarge
                )
                Text(
                    text = item.subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = "Navigate",
                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(20.dp)
            )
        }
        
        if (showDivider) {
            HorizontalDivider(
                modifier = Modifier.padding(horizontal = ClutchSpacing.md),
                color = MaterialTheme.colorScheme.outline.copy(alpha = 0.5f)
            )
        }
    }
}

data class SettingsItem(
    val icon: ImageVector,
    val title: String,
    val subtitle: String,
    val onClick: () -> Unit
)
