package com.clutch.partners

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import com.clutch.partners.utils.ThemeManager

// Extension properties for additional colors
val ColorScheme.success: Color
    get() = Color(0xFF27AE60)

val ColorScheme.warning: Color
    get() = Color(0xFFF39C12)

val ColorScheme.info: Color
    get() = Color(0xFF3498DB)

@Composable
fun ClutchPartnersTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val context = LocalContext.current
    val isDarkTheme = ThemeManager.isDarkTheme(context)
    val colorScheme = if (isDarkTheme) {
        darkColorScheme(
            // Dark theme colors from Partners Design.json
            primary = Color(0xFFF5F5F5), // Primary brand color for dark mode
            onPrimary = Color(0xFF0F0D0F), // Text color on primary-colored elements in dark mode
            secondary = Color(0xFF2f2f2f), // Secondary color for dark mode
            onSecondary = Color(0xFFF5F5F5), // Text color on secondary elements
            tertiary = Color(0xFFF5F5F5), // Tertiary color
            onTertiary = Color(0xFF0F0D0F), // Text color on tertiary elements
            background = Color(0xFF0F0D0F), // Main background color for dark mode
            onBackground = Color(0xFFF5F5F5), // Main text and icon color for dark mode
            surface = Color(0xFF242424), // Background color for cards in dark mode
            onSurface = Color(0xFFF5F5F5), // Text color on cards in dark mode
            surfaceVariant = Color(0xFF2f2f2f), // Muted color for backgrounds in dark mode
            onSurfaceVariant = Color(0xFFA0A0A0), // Text color on muted backgrounds in dark mode
            error = Color(0xFFC0392B), // Destructive color for dark mode
            onError = Color(0xFFF5F5F5), // Text color on error elements
            outline = Color(0xFF404040), // Border color for dark mode
            outlineVariant = Color(0xFF303030), // Input background color for dark mode
            scrim = Color(0xFF0F0D0F) // Scrim color
        )
    } else {
        lightColorScheme(
            // Light theme colors from Partners Design.json
            primary = Color(0xFF242424), // Primary brand color
            onPrimary = Color(0xFFF5F5F5), // Text color on primary-colored elements
            secondary = Color(0xFF2f2f2f), // Secondary color
            onSecondary = Color(0xFFF5F5F5), // Text color on secondary elements
            tertiary = Color(0xFF242424), // Tertiary color
            onTertiary = Color(0xFFF5F5F5), // Text color on tertiary elements
            background = Color(0xFFF5F5F5), // Main background color
            onBackground = Color(0xFF242424), // Main text and icon color
            surface = Color(0xFFFFFFFF), // Background color for cards and containers
            onSurface = Color(0xFF0F0D0F), // Text color on cards
            surfaceVariant = Color(0xFFE0E0E0), // Light, muted color for backgrounds and dividers
            onSurfaceVariant = Color(0xFFA0A0A0), // Text color on muted backgrounds
            error = Color(0xFFC0392B), // Color for destructive actions
            onError = Color(0xFFF5F5F5), // Text color on error elements
            outline = Color(0xFFCCCCCC), // Border color for elements
            outlineVariant = Color(0xFFF0F0F0), // Background color for input fields
            scrim = Color(0xFFF5F5F5) // Scrim color
        )
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content
    )
}
