package com.clutch.partners.ui.theme

import android.content.Context
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import com.clutch.partners.utils.LanguageManager

object ThemeManager {
    private var isDarkMode: Boolean = false
    
    fun setDarkMode(darkMode: Boolean) {
        isDarkMode = darkMode
    }
    
    fun getDarkMode(): Boolean = isDarkMode
    
    @Composable
    fun getCurrentTheme(): Boolean {
        val context = LocalContext.current
        val systemDarkMode = isSystemInDarkTheme()
        return isDarkMode || systemDarkMode
    }
}

@Composable
fun ClutchPartnersTheme(
    darkTheme: Boolean = ThemeManager.getCurrentTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) {
        ClutchDarkColorScheme
    } else {
        ClutchLightColorScheme
    }
    
    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}

val ClutchLightColorScheme = lightColorScheme(
    primary = PartnersBlue,
    onPrimary = Color.White,
    primaryContainer = PartnersBlue.copy(alpha = 0.1f),
    onPrimaryContainer = PartnersBlue,
    
    secondary = LightSecondary,
    onSecondary = LightSecondaryForeground,
    secondaryContainer = LightSecondary.copy(alpha = 0.1f),
    onSecondaryContainer = LightSecondary,
    
    tertiary = Orange,
    onTertiary = Color.White,
    tertiaryContainer = Orange.copy(alpha = 0.1f),
    onTertiaryContainer = Orange,
    
    error = LightDestructive,
    onError = Color.White,
    errorContainer = LightDestructive.copy(alpha = 0.1f),
    onErrorContainer = LightDestructive,
    
    background = LightBackground,
    onBackground = LightForeground,
    surface = LightCard,
    onSurface = LightCardForeground,
    surfaceVariant = LightMuted,
    onSurfaceVariant = LightMutedForeground,
    
    outline = LightBorder,
    outlineVariant = LightRing,
    scrim = Color.Black.copy(alpha = 0.5f)
)

val ClutchDarkColorScheme = darkColorScheme(
    primary = PartnersBlue,
    onPrimary = Color.White,
    primaryContainer = PartnersBlue.copy(alpha = 0.2f),
    onPrimaryContainer = PartnersBlue,
    
    secondary = DarkSecondary,
    onSecondary = DarkSecondaryForeground,
    secondaryContainer = DarkSecondary.copy(alpha = 0.1f),
    onSecondaryContainer = DarkSecondary,
    
    tertiary = Orange,
    onTertiary = Color.White,
    tertiaryContainer = Orange.copy(alpha = 0.2f),
    onTertiaryContainer = Orange,
    
    error = DarkDestructive,
    onError = Color.White,
    errorContainer = DarkDestructive.copy(alpha = 0.2f),
    onErrorContainer = DarkDestructive,
    
    background = DarkBackground,
    onBackground = DarkForeground,
    surface = DarkCard,
    onSurface = DarkCardForeground,
    surfaceVariant = DarkMuted,
    onSurfaceVariant = DarkMutedForeground,
    
    outline = DarkBorder,
    outlineVariant = DarkRing,
    scrim = Color.Black.copy(alpha = 0.7f)
)

@Composable
fun getStatusColor(status: String, isDark: Boolean = ThemeManager.getCurrentTheme()): Color {
    return when (status.lowercase()) {
        "pending" -> if (isDark) DarkWarning else LightWarning
        "paid", "completed", "approved" -> if (isDark) DarkSuccess else LightSuccess
        "rejected", "failed", "cancelled" -> if (isDark) DarkDestructive else LightDestructive
        "in_progress", "processing" -> if (isDark) DarkInfo else LightInfo
        else -> if (isDark) DarkMutedForeground else LightMutedForeground
    }
}

@Composable
fun getPriorityColor(priority: String, isDark: Boolean = ThemeManager.getCurrentTheme()): Color {
    return when (priority.lowercase()) {
        "low" -> if (isDark) DarkSuccess else LightSuccess
        "medium" -> if (isDark) DarkWarning else LightWarning
        "high" -> if (isDark) DarkDestructive else LightDestructive
        else -> if (isDark) DarkMutedForeground else LightMutedForeground
    }
}

@Composable
fun getSeverityColor(severity: String, isDark: Boolean = ThemeManager.getCurrentTheme()): Color {
    return when (severity.lowercase()) {
        "info" -> if (isDark) DarkInfo else LightInfo
        "success" -> if (isDark) DarkSuccess else LightSuccess
        "warning" -> if (isDark) DarkWarning else LightWarning
        "error" -> if (isDark) DarkDestructive else LightDestructive
        else -> if (isDark) DarkMutedForeground else LightMutedForeground
    }
}
