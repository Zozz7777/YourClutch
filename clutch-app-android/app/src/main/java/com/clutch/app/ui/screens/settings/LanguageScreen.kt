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
import androidx.compose.ui.graphics.Color
import com.clutch.app.ui.theme.ClutchColors
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * LanguageScreen.kt - Language selection and preferences
 * 
 * Complete language settings screen with language selection,
 * regional preferences, and text direction settings.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LanguageScreen(
    onNavigateBack: () -> Unit = {}
) {
    var selectedLanguage by remember { mutableStateOf("English") }
    var selectedRegion by remember { mutableStateOf("United States") }
    var textDirection by remember { mutableStateOf("LTR") }

    val languages = listOf(
        Language("English", "United States", "LTR", true),
        Language("العربية", "Saudi Arabia", "RTL", false),
        Language("Español", "Spain", "LTR", false),
        Language("Français", "France", "LTR", false),
        Language("Deutsch", "Germany", "LTR", false),
        Language("Italiano", "Italy", "LTR", false),
        Language("Português", "Brazil", "LTR", false),
        Language("Русский", "Russia", "LTR", false),
        Language("中文", "China", "LTR", false),
        Language("日本語", "Japan", "LTR", false),
        Language("한국어", "South Korea", "LTR", false),
        Language("हिन्दी", "India", "LTR", false)
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Language") },
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
                        text = "Language & Region",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                }
            }

            item {
                // Current Language Info
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Text(
                            text = "Current Language",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        Text(
                            text = "English (United States)",
                            fontSize = 14.sp,
                            color = Color.Gray
                        )
                        Text(
                            text = "Text Direction: Left to Right",
                            fontSize = 12.sp,
                            color = Color.Gray
                        )
                    }
                }
            }

            item {
                // Language Selection
                Text(
                    text = "Select Language",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black,
                    modifier = Modifier.padding(bottom = ClutchSpacing.sm)
                )
            }

            items(languages) { language ->
                LanguageItemCard(
                    language = language,
                    isSelected = selectedLanguage == language.name,
                    onSelect = { 
                        selectedLanguage = language.name
                        selectedRegion = language.region
                        textDirection = language.direction
                    }
                )
            }

            item {
                // Language Features
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Text(
                            text = "Language Features",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        LanguageFeature(
                            icon = Icons.Default.Translate,
                            title = "Auto-Translate",
                            description = "Automatically translate content when available"
                        )
                        
                        LanguageFeature(
                            icon = Icons.Default.VolumeUp,
                            title = "Voice Commands",
                            description = "Use voice commands in your selected language"
                        )
                        
                        LanguageFeature(
                            icon = Icons.Default.TextFields,
                            title = "Text Direction",
                            description = "Automatic text direction based on language"
                        )
                    }
                }
            }

            item {
                // Apply Button
                Button(
                    onClick = { /* Apply language changes */ },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = ClutchRed)
                ) {
                    Text(
                        text = "Apply Language",
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            item {
                Spacer(modifier = Modifier.height(100.dp))
            }
        }
    }
}

@Composable
private fun LanguageItemCard(
    language: Language,
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
                    text = language.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (isSelected) ClutchRed else Color.Black
                )
                Text(
                    text = language.region,
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                Text(
                    text = "Direction: ${language.direction}",
                    fontSize = 12.sp,
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
private fun LanguageFeature(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    description: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = ClutchSpacing.sm),
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

data class Language(
    val name: String,
    val region: String,
    val direction: String,
    val isDefault: Boolean = false
)
