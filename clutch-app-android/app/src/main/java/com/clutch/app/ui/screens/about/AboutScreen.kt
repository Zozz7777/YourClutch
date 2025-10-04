package com.clutch.app.ui.screens.about

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * AboutScreen.kt - App information and details
 * 
 * Complete about screen with app information,
 * version details, and legal information.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AboutScreen(
    onNavigateBack: () -> Unit = {},
    onViewPrivacyPolicy: () -> Unit = {},
    onViewTermsOfService: () -> Unit = {},
    onViewLicenses: () -> Unit = {},
    onRateApp: () -> Unit = {},
    onShareApp: () -> Unit = {}
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
                    text = stringResource(R.string.about),
                    style = MaterialTheme.typography.headlineMedium
                )
                Spacer(modifier = Modifier.size(48.dp))
            }
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
                    // App Icon
                    Box(
                        modifier = Modifier
                            .size(80.dp)
                            .background(
                                MaterialTheme.colorScheme.primary,
                                CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.CarRepair,
                            contentDescription = stringResource(R.string.app_icon),
                            modifier = Modifier.size(40.dp),
                            tint = MaterialTheme.colorScheme.onPrimary
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.md))
                    
                    // App Name
                    Text(
                        text = stringResource(R.string.app_name),
                        style = MaterialTheme.typography.headlineMedium
                    )
                    
                    // Tagline
                    Text(
                        text = stringResource(R.string.app_tagline),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.md))
                    
                    // Version
                    Text(
                        text = stringResource(R.string.version_1_0_0),
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.primary
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    // Build
                    Text(
                        text = stringResource(R.string.build_100),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        item {
            // App Description
            ClutchCardBasic {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(ClutchComponentSpacing.cardPadding)
                ) {
                    Text(
                        text = stringResource(R.string.about_clutch),
                        style = MaterialTheme.typography.titleLarge
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.md))
                    
                    Text(
                        text = stringResource(R.string.about_clutch_description),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.md))
                    
                    Text(
                        text = stringResource(R.string.our_mission),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }

        item {
            // Features
            AboutSection(
                title = stringResource(R.string.key_features),
                items = listOf(
                    AboutItem(
                        icon = Icons.Default.CarRepair,
                        title = stringResource(R.string.professional_services),
                        description = stringResource(R.string.expert_mechanics_quality_service)
                    ),
                    AboutItem(
                        icon = Icons.Default.ShoppingCart,
                        title = stringResource(R.string.quality_parts),
                        description = stringResource(R.string.genuine_parts_accessories)
                    ),
                    AboutItem(
                        icon = Icons.Default.MonitorHeart,
                        title = stringResource(R.string.car_health_monitoring),
                        description = stringResource(R.string.track_car_condition_maintenance)
                    ),
                    AboutItem(
                        icon = Icons.Default.Star,
                        title = stringResource(R.string.loyalty_program),
                        description = stringResource(R.string.earn_points_rewards_loyalty)
                    )
                )
            )
        }

        item {
            // Company Information
            AboutSection(
                title = stringResource(R.string.company_information),
                items = listOf(
                    AboutItem(
                        icon = Icons.Default.Business,
                        title = stringResource(R.string.company),
                        description = stringResource(R.string.clutch_technologies_inc)
                    ),
                    AboutItem(
                        icon = Icons.Default.DateRange,
                        title = stringResource(R.string.founded),
                        description = stringResource(R.string.year_2024)
                    ),
                    AboutItem(
                        icon = Icons.Default.LocationOn,
                        title = stringResource(R.string.location),
                        description = stringResource(R.string.new_york_ny)
                    ),
                    AboutItem(
                        icon = Icons.Default.Email,
                        title = stringResource(R.string.contact),
                        description = stringResource(R.string.support_clutch_com)
                    )
                )
            )
        }

        item {
            // Legal Information
            AboutSection(
                title = stringResource(R.string.legal_information),
                items = listOf(
                    AboutItem(
                        icon = Icons.Default.PrivacyTip,
                        title = stringResource(R.string.privacy_policy),
                        description = stringResource(R.string.how_we_protect_your_data),
                        onClick = onViewPrivacyPolicy
                    ),
                    AboutItem(
                        icon = Icons.Default.Description,
                        title = stringResource(R.string.terms_of_service),
                        description = stringResource(R.string.terms_and_conditions),
                        onClick = onViewTermsOfService
                    ),
                    AboutItem(
                        icon = Icons.Default.Copyright,
                        title = stringResource(R.string.open_source_licenses),
                        description = stringResource(R.string.third_party_libraries_licenses),
                        onClick = onViewLicenses
                    )
                )
            )
        }

        item {
            // App Actions
            ClutchCardBasic {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(ClutchComponentSpacing.cardPadding)
                ) {
                    Text(
                        text = stringResource(R.string.app_actions),
                        style = MaterialTheme.typography.titleLarge
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.md))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(ClutchSpacing.md)
                    ) {
                        ClutchButtonPrimary(
                            onClick = onRateApp,
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Star,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(ClutchSpacing.sm))
                            Text(stringResource(R.string.rate_app))
                        }
                        
                        ClutchButtonOutlined(
                            onClick = onShareApp,
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Share,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(ClutchSpacing.sm))
                            Text(stringResource(R.string.share_app))
                        }
                    }
                }
            }
        }

        item {
            // Copyright
            Text(
                text = stringResource(R.string.copyright_2024_clutch),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(ClutchSpacing.md)
            )
        }
    }
}

@Composable
private fun AboutSection(
    title: String,
    items: List<AboutItem>
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
                    AboutItemRow(
                        item = item,
                        showDivider = index < items.size - 1
                    )
                }
            }
        }
    }
}

@Composable
private fun AboutItemRow(
    item: AboutItem,
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
                    text = item.description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            
            if (item.onClick != null) {
                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = stringResource(R.string.navigate),
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

data class AboutItem(
    val icon: ImageVector,
    val title: String,
    val description: String,
    val onClick: (() -> Unit)? = null
)
