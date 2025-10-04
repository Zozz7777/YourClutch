package com.clutch.app.ui.screens.about

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
import androidx.compose.ui.graphics.Color
import com.clutch.app.ui.theme.ClutchColors
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * LicensesScreen.kt - Open source licenses and attributions
 * 
 * Complete licenses screen with open source library information,
 * third-party attributions, and license details.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LicensesScreen(
    onNavigateBack: () -> Unit = {}
) {
    var selectedLicense by remember { mutableStateOf("") }

    val licenses = listOf(
        LicenseInfo(
            name = "Android Jetpack Compose",
            version = "1.5.15",
            license = "Apache License 2.0",
            description = "Modern UI toolkit for Android development",
            url = "https://developer.android.com/jetpack/compose"
        ),
        LicenseInfo(
            name = "Material Design 3",
            version = "1.1.0",
            license = "Apache License 2.0",
            description = "Material Design components and theming",
            url = "https://m3.material.io/"
        ),
        LicenseInfo(
            name = "Retrofit",
            version = "3.0.0",
            license = "Apache License 2.0",
            description = "Type-safe HTTP client for Android",
            url = "https://square.github.io/retrofit/"
        ),
        LicenseInfo(
            name = "OkHttp",
            version = "5.1.0",
            license = "Apache License 2.0",
            description = "HTTP client for Android and Java applications",
            url = "https://square.github.io/okhttp/"
        ),
        LicenseInfo(
            name = "Hilt",
            version = "2.57.2",
            license = "Apache License 2.0",
            description = "Dependency injection library for Android",
            url = "https://dagger.dev/hilt/"
        ),
        LicenseInfo(
            name = "Coil",
            version = "3.3.0",
            license = "Apache License 2.0",
            description = "Image loading library for Android",
            url = "https://coil-kt.github.io/coil/"
        ),
        LicenseInfo(
            name = "Kotlinx Coroutines",
            version = "1.10.2",
            license = "Apache License 2.0",
            description = "Coroutines support for Kotlin",
            url = "https://github.com/Kotlin/kotlinx.coroutines"
        ),
        LicenseInfo(
            name = "Kotlinx DateTime",
            version = "0.6.1",
            license = "Apache License 2.0",
            description = "Date and time library for Kotlin",
            url = "https://github.com/Kotlin/kotlinx-datetime"
        ),
        LicenseInfo(
            name = "Gson",
            version = "2.11.0",
            license = "Apache License 2.0",
            description = "JSON serialization/deserialization library",
            url = "https://github.com/google/gson"
        ),
        LicenseInfo(
            name = "DataStore Preferences",
            version = "1.1.1",
            license = "Apache License 2.0",
            description = "Data storage solution for Android",
            url = "https://developer.android.com/topic/libraries/architecture/datastore"
        ),
        LicenseInfo(
            name = "Accompanist Permissions",
            version = "0.35.0-alpha",
            license = "Apache License 2.0",
            description = "Permission handling for Compose",
            url = "https://github.com/google/accompanist"
        ),
        LicenseInfo(
            name = "Android Biometric",
            version = "1.1.0",
            license = "Apache License 2.0",
            description = "Biometric authentication for Android",
            url = "https://developer.android.com/jetpack/androidx/releases/biometric"
        )
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Open Source Licenses") },
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
                    text = "Open Source Licenses",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
            }

            item {
                // Introduction
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Text(
                            text = "Third-Party Libraries",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        Text(
                            text = "This app uses several open source libraries. We are grateful to the developers who have contributed to these projects.",
                            fontSize = 14.sp,
                            color = Color.Black,
                            lineHeight = 20.sp
                        )
                    }
                }
            }

            items(licenses) { license ->
                LicenseCard(
                    license = license,
                    isExpanded = selectedLicense == license.name,
                    onToggle = {
                        selectedLicense = if (selectedLicense == license.name) "" else license.name
                    }
                )
            }

            item {
                // License Summary
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.success.copy(alpha = 0.1f)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Info,
                                contentDescription = null,
                                tint = ClutchColors.success,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(ClutchSpacing.sm))
                            Text(
                                text = "License Summary",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = ClutchColors.success
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        Text(
                            text = "All third-party libraries used in this app are licensed under the Apache License 2.0, which is a permissive open source license that allows for commercial use, modification, and distribution.",
                            fontSize = 14.sp,
                            color = Color(0xFF2E7D32),
                            lineHeight = 20.sp
                        )
                    }
                }
            }

            item {
                // Contact Information
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Text(
                            text = "Questions about Licenses?",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        Text(
                            text = "If you have any questions about the licenses or would like to request a copy of the source code, please contact us:",
                            fontSize = 14.sp,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        ContactInfo(
                            icon = Icons.Default.Email,
                            label = "Email",
                            value = "legal@clutch.com"
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
private fun LicenseCard(
    license: LicenseInfo,
    isExpanded: Boolean,
    onToggle: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onToggle() },
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
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
                        text = license.name,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.Black
                    )
                    Text(
                        text = "Version ${license.version}",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                    Text(
                        text = license.license,
                        fontSize = 12.sp,
                        color = ClutchRed
                    )
                }
                
                Icon(
                    imageVector = if (isExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = null,
                    tint = ClutchRed
                )
            }
            
            if (isExpanded) {
                HorizontalDivider(color = ClutchColors.mutedForeground)
                Column(
                    modifier = Modifier.padding(ClutchSpacing.md)
                ) {
                    Text(
                        text = license.description,
                        fontSize = 14.sp,
                        color = Color.Black,
                        lineHeight = 20.sp
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    Text(
                        text = "Website: ${license.url}",
                        fontSize = 12.sp,
                        color = ClutchRed
                    )
                }
            }
        }
    }
}

@Composable
private fun ContactInfo(
    icon: ImageVector,
    label: String,
    value: String
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
                text = label,
                fontSize = 12.sp,
                color = Color.Gray
            )
            Text(
                text = value,
                fontSize = 14.sp,
                color = Color.Black
            )
        }
    }
}

data class LicenseInfo(
    val name: String,
    val version: String,
    val license: String,
    val description: String,
    val url: String
)
