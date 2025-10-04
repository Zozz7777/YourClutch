package com.clutch.app.ui.screens.settings

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
import com.clutch.app.ui.theme.ClutchColors
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * ThemeScreen.kt - Theme selection and customization
 * 
 * Complete theme settings screen with theme selection,
 * color customization, and appearance preferences.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ThemeScreen(
    onNavigateBack: () -> Unit = {}
) {
    var selectedTheme by remember { mutableStateOf("light") }
    var selectedAccentColor by remember { mutableStateOf("red") }
    var autoTheme by remember { mutableStateOf(false) }
    var darkMode by remember { mutableStateOf(false) }

    val themes = listOf(
        Theme("light", "Light", "Clean and bright interface", false),
        Theme("dark", "Dark", "Easy on the eyes in low light", false),
        Theme("auto", "Auto", "Follows system settings", true)
    )

    val accentColors = listOf(
        AccentColor("red", "Red", ClutchRed),
        AccentColor("blue", "Blue", Color(0xFF2196F3)),
        AccentColor("green", "Green", Color(0xFF4CAF50)),
        AccentColor("purple", "Purple", Color(0xFF9C27B0)),
        AccentColor("orange", "Orange", Color(0xFFFF9800)),
        AccentColor("teal", "Teal", Color(0xFF009688))
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Theme") },
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
                        text = "Appearance",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                }
            }

            item {
                // Current Theme Info
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Text(
                            text = "Current Theme",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        Text(
                            text = "Light Theme with Red Accent",
                            fontSize = 14.sp,
                            color = Color.Gray
                        )
                    }
                }
            }

            item {
                // Theme Selection
                Text(
                    text = "Select Theme",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black,
                    modifier = Modifier.padding(bottom = ClutchSpacing.sm)
                )
            }

            items(themes) { theme ->
                ThemeItemCard(
                    theme = theme,
                    isSelected = selectedTheme == theme.id,
                    onSelect = { selectedTheme = theme.id }
                )
            }

            item {
                // Accent Color Selection
                Text(
                    text = "Accent Color",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black,
                    modifier = Modifier.padding(bottom = ClutchSpacing.sm)
                )
            }

            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(ClutchSpacing.sm)
                ) {
                    items(accentColors) { color ->
                        AccentColorCard(
                            accentColor = color,
                            isSelected = selectedAccentColor == color.id,
                            onSelect = { selectedAccentColor = color.id }
                        )
                    }
                }
            }

            item {
                // Theme Options
                ThemeOptionsSection(
                    autoTheme = autoTheme,
                    darkMode = darkMode,
                    onAutoThemeChange = { autoTheme = it },
                    onDarkModeChange = { darkMode = it }
                )
            }

            item {
                // Preview
                ThemePreviewCard(
                    selectedTheme = selectedTheme,
                    selectedAccentColor = selectedAccentColor
                )
            }

            item {
                // Apply Button
                Button(
                    onClick = { /* Apply theme changes */ },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = ClutchRed)
                ) {
                    Text(
                        text = "Apply Theme",
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
private fun ThemeItemCard(
    theme: Theme,
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
                    text = theme.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (isSelected) ClutchRed else Color.Black
                )
                Text(
                    text = theme.description,
                    fontSize = 14.sp,
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
private fun AccentColorCard(
    accentColor: AccentColor,
    isSelected: Boolean,
    onSelect: () -> Unit
) {
    Card(
        modifier = Modifier
            .size(80.dp)
            .clickable { onSelect() },
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = if (isSelected) 4.dp else 2.dp)
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
                    .size(32.dp)
                    .clip(CircleShape)
                    .background(accentColor.color)
            )
            
            Spacer(modifier = Modifier.height(ClutchSpacing.xs))
            
            Text(
                text = accentColor.name,
                fontSize = 10.sp,
                color = Color.Black
            )
        }
    }
}

@Composable
private fun ThemeOptionsSection(
    autoTheme: Boolean,
    darkMode: Boolean,
    onAutoThemeChange: (Boolean) -> Unit,
    onDarkModeChange: (Boolean) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(ClutchSpacing.md)
        ) {
            Text(
                text = "Theme Options",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.Black
            )
            
            Spacer(modifier = Modifier.height(ClutchSpacing.sm))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Auto Theme",
                    fontSize = 14.sp,
                    color = Color.Black
                )
                Switch(
                    checked = autoTheme,
                    onCheckedChange = onAutoThemeChange,
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = ClutchRed
                    )
                )
            }
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Dark Mode",
                    fontSize = 14.sp,
                    color = Color.Black
                )
                Switch(
                    checked = darkMode,
                    onCheckedChange = onDarkModeChange,
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = ClutchRed
                    )
                )
            }
        }
    }
}

@Composable
private fun ThemePreviewCard(
    selectedTheme: String,
    selectedAccentColor: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier.padding(ClutchSpacing.md)
        ) {
            Text(
                text = "Preview",
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.Black
            )
            
            Spacer(modifier = Modifier.height(ClutchSpacing.sm))
            
            // Preview sample
            Card(
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(ClutchSpacing.md)
                ) {
                    Text(
                        text = "Sample Card",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.Black
                    )
                    Text(
                        text = "This is how your theme will look",
                        fontSize = 12.sp,
                        color = Color.Gray
                    )
                }
            }
        }
    }
}

data class Theme(
    val id: String,
    val name: String,
    val description: String,
    val isDefault: Boolean = false
)

data class AccentColor(
    val id: String,
    val name: String,
    val color: Color
)
