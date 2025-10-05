package com.clutch.partners

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

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
    val colorScheme = if (darkTheme) {
        darkColorScheme(
            primary = Color(0xFF242424),
            secondary = Color(0xFF2f2f2f),
            background = Color(0xFF0F0D0F),
            surface = Color(0xFF242424),
            onPrimary = Color(0xFFF5F5F5),
            onSecondary = Color(0xFFF5F5F5),
            onBackground = Color(0xFFF5F5F5),
            onSurface = Color(0xFFF5F5F5),
            error = Color(0xFFC0392B),
            onError = Color(0xFFF5F5F5)
        )
    } else {
        lightColorScheme(
            primary = Color(0xFF242424),
            secondary = Color(0xFF2f2f2f),
            background = Color(0xFFF5F5F5),
            surface = Color(0xFFFFFFFF),
            onPrimary = Color(0xFFF5F5F5),
            onSecondary = Color(0xFFF5F5F5),
            onBackground = Color(0xFF242424),
            onSurface = Color(0xFF0F0D0F),
            error = Color(0xFFC0392B),
            onError = Color(0xFFF5F5F5)
        )
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content
    )
}
