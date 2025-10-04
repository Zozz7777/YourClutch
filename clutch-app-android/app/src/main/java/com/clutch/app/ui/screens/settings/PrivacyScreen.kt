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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.graphics.Color
import com.clutch.app.ui.theme.ClutchColors
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * PrivacyScreen.kt - Privacy settings and data management
 * 
 * Complete privacy settings screen with data privacy controls,
 * account privacy settings, and data management options.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PrivacyScreen(
    onNavigateBack: () -> Unit = {}
) {
    var profileVisibility by remember { mutableStateOf("friends") }
    var locationSharing by remember { mutableStateOf(false) }
    var dataAnalytics by remember { mutableStateOf(true) }
    var marketingData by remember { mutableStateOf(false) }
    var thirdPartySharing by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Privacy") },
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
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Privacy Settings",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                }
            }

            item {
                // Account Privacy
                PrivacySection(
                    title = "Account Privacy",
                    items = listOf(
                        PrivacyItem(
                            icon = Icons.Default.Visibility,
                            title = "Profile Visibility",
                            description = "Who can see your profile",
                            value = profileVisibility,
                            onClick = { /* Show visibility options */ }
                        ),
                        PrivacyItem(
                            icon = Icons.Default.LocationOn,
                            title = "Location Sharing",
                            description = "Share your location with the app",
                            isToggle = true,
                            isEnabled = locationSharing,
                            onToggle = { locationSharing = !locationSharing }
                        )
                    )
                )
            }

            item {
                // Data Privacy
                PrivacySection(
                    title = "Data Privacy",
                    items = listOf(
                        PrivacyItem(
                            icon = Icons.Default.Analytics,
                            title = "Data Analytics",
                            description = "Help improve the app with anonymous usage data",
                            isToggle = true,
                            isEnabled = dataAnalytics,
                            onToggle = { dataAnalytics = !dataAnalytics }
                        ),
                        PrivacyItem(
                            icon = Icons.Default.Campaign,
                            title = "Marketing Data",
                            description = "Use your data for personalized marketing",
                            isToggle = true,
                            isEnabled = marketingData,
                            onToggle = { marketingData = !marketingData }
                        ),
                        PrivacyItem(
                            icon = Icons.Default.Share,
                            title = "Third-Party Sharing",
                            description = "Share data with trusted partners",
                            isToggle = true,
                            isEnabled = thirdPartySharing,
                            onToggle = { thirdPartySharing = !thirdPartySharing }
                        )
                    )
                )
            }

            item {
                // Data Management
                PrivacySection(
                    title = "Data Management",
                    items = listOf(
                        PrivacyItem(
                            icon = Icons.Default.Download,
                            title = "Download My Data",
                            description = "Download a copy of your data",
                            onClick = { /* Download data */ }
                        ),
                        PrivacyItem(
                            icon = Icons.Default.Delete,
                            title = "Delete Account",
                            description = "Permanently delete your account and data",
                            onClick = { /* Delete account */ }
                        )
                    )
                )
            }

            item {
                // Privacy Policy
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Text(
                            text = "Privacy Policy",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        Text(
                            text = "Learn more about how we collect, use, and protect your personal information.",
                            fontSize = 14.sp,
                            color = Color.Gray
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        TextButton(
                            onClick = { /* Open privacy policy */ }
                        ) {
                            Text("Read Privacy Policy", color = ClutchRed)
                        }
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
private fun PrivacySection(
    title: String,
    items: List<PrivacyItem>
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(ClutchSpacing.sm)
    ) {
        Text(
            text = title,
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color.Black,
            modifier = Modifier.padding(bottom = ClutchSpacing.sm)
        )
        
        items.forEach { item ->
            PrivacyItemCard(item = item)
        }
    }
}

@Composable
private fun PrivacyItemCard(
    item: PrivacyItem
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { item.onClick() },
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(ClutchSpacing.md),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = null,
                tint = ClutchRed,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.width(ClutchSpacing.md))
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = item.title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.Black
                )
                Text(
                    text = item.description,
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                if (item.value != null) {
                    Text(
                        text = item.value,
                        fontSize = 12.sp,
                        color = ClutchRed
                    )
                }
            }
            
            if (item.isToggle) {
                Switch(
                    checked = item.isEnabled,
                    onCheckedChange = { item.onToggle?.invoke() },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = ClutchRed,
                        uncheckedThumbColor = Color.White,
                        uncheckedTrackColor = Color.Gray
                    )
                )
            } else {
                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = Color.Gray
                )
            }
        }
    }
}

data class PrivacyItem(
    val icon: ImageVector,
    val title: String,
    val description: String,
    val value: String? = null,
    val isToggle: Boolean = false,
    val isEnabled: Boolean = false,
    val onToggle: (() -> Unit)? = null,
    val onClick: () -> Unit = {}
)
