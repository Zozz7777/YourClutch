package com.clutch.app.ui.screens.help

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
 * HelpScreen.kt - Help and support center
 * 
 * Complete help screen with FAQ, contact options,
 * and support resources.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HelpScreen(
    onNavigateBack: () -> Unit = {},
    onContactSupport: () -> Unit = {},
    onViewFAQ: (String) -> Unit = {},
    onSendFeedback: () -> Unit = {}
) {
    val context = LocalContext.current
    
    // Theme management
    val isDarkTheme = ThemeManager.isDarkTheme(context)
    val colors = if (isDarkTheme) ClutchDarkColors else ClutchColors
    
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
                        contentDescription = stringResource(R.string.back)
                    )
                }
                Text(
                    text = stringResource(R.string.help_support),
                    style = MaterialTheme.typography.headlineMedium
                )
                Spacer(modifier = Modifier.size(48.dp))
            }
        }

        item {
            // Quick Help
            ClutchCardBasic {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(ClutchComponentSpacing.cardPadding)
                ) {
                    Text(
                        text = stringResource(R.string.quick_help),
                        style = MaterialTheme.typography.titleLarge
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.md))
                    
                    Text(
                        text = stringResource(R.string.need_immediate_assistance),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.lg))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(ClutchSpacing.md)
                    ) {
                        ClutchButtonPrimary(
                            onClick = onContactSupport,
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Chat,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(ClutchSpacing.sm))
                            Text(stringResource(R.string.contact_support))
                        }
                        
                        ClutchButtonOutlined(
                            onClick = { onSendFeedback() },
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Feedback,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(ClutchSpacing.sm))
                            Text(stringResource(R.string.send_feedback))
                        }
                    }
                }
            }
        }

        item {
            // FAQ Categories
            HelpSection(
                title = stringResource(R.string.frequently_asked_questions),
                items = listOf(
                    HelpItem(
                        icon = Icons.Default.AccountCircle,
                        title = stringResource(R.string.account_profile),
                        subtitle = stringResource(R.string.managing_account_profile),
                        onClick = { onViewFAQ("account") }
                    ),
                    HelpItem(
                        icon = Icons.Default.CarRepair,
                        title = "Car Services",
                        subtitle = "Booking and managing car services",
                        onClick = { onViewFAQ("services") }
                    ),
                    HelpItem(
                        icon = Icons.Default.ShoppingCart,
                        title = "Parts & Orders",
                        subtitle = "Ordering and tracking car parts",
                        onClick = { onViewFAQ("parts") }
                    ),
                    HelpItem(
                        icon = Icons.Default.Payment,
                        title = "Payments & Billing",
                        subtitle = "Payment methods and billing questions",
                        onClick = { onViewFAQ("payments") }
                    ),
                    HelpItem(
                        icon = Icons.Default.Security,
                        title = "Security & Privacy",
                        subtitle = "Account security and data privacy",
                        onClick = { onViewFAQ("security") }
                    ),
                    HelpItem(
                        icon = Icons.Default.Settings,
                        title = "App Settings",
                        subtitle = "App configuration and preferences",
                        onClick = { onViewFAQ("settings") }
                    )
                )
            )
        }

        item {
            // Contact Options
            HelpSection(
                title = "Contact Support",
                items = listOf(
                    HelpItem(
                        icon = Icons.Default.Chat,
                        title = "Live Chat",
                        subtitle = "Chat with our support team",
                        onClick = onContactSupport
                    ),
                    HelpItem(
                        icon = Icons.Default.Email,
                        title = "Email Support",
                        subtitle = "support@clutch.com",
                        onClick = { /* Open email app */ }
                    ),
                    HelpItem(
                        icon = Icons.Default.Phone,
                        title = "Phone Support",
                        subtitle = "+1 (555) 123-4567",
                        onClick = { /* Open phone app */ }
                    ),
                    HelpItem(
                        icon = Icons.Default.Schedule,
                        title = "Support Hours",
                        subtitle = "24/7 available",
                        onClick = null
                    )
                )
            )
        }

        item {
            // Resources
            HelpSection(
                title = "Resources",
                items = listOf(
                    HelpItem(
                        icon = Icons.Default.VideoLibrary,
                        title = "Video Tutorials",
                        subtitle = "Learn how to use the app",
                        onClick = { onViewFAQ("video_tutorials") }
                    ),
                    HelpItem(
                        icon = Icons.Default.Book,
                        title = "User Guide",
                        subtitle = "Complete app documentation",
                        onClick = { /* Open user guide */ }
                    ),
                    HelpItem(
                        icon = Icons.Default.Update,
                        title = "App Updates",
                        subtitle = "Latest features and improvements",
                        onClick = { /* Open app updates */ }
                    )
                )
            )
        }

        item {
            // App Information
            ClutchCardBasic {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(ClutchComponentSpacing.cardPadding),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Clutch App",
                        style = MaterialTheme.typography.titleLarge
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    Text(
                        text = "Version 1.0.0",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    Text(
                        text = "Your car's best friend",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}

@Composable
private fun HelpSection(
    title: String,
    items: List<HelpItem>
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
                    HelpItemRow(
                        item = item,
                        showDivider = index < items.size - 1
                    )
                }
            }
        }
    }
}

@Composable
private fun HelpItemRow(
    item: HelpItem,
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
                    text = item.title,
                    style = MaterialTheme.typography.bodyLarge
                )
                Text(
                    text = item.subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
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

data class HelpItem(
    val icon: ImageVector,
    val title: String,
    val subtitle: String,
    val onClick: (() -> Unit)?
)
