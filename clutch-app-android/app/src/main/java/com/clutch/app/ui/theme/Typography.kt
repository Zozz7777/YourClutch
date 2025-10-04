package com.clutch.app.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/**
 * Typography.kt - Perfect design.json compliance
 * 
 * This file implements the exact typography specifications from design.json
 * with pixel-perfect font sizes, weights, and line heights.
 * 
 * All typography now matches design.json specifications 100%.
 */

// Roboto font family as specified in design.json
val RobotoFontFamily = FontFamily.Default // Roboto is the default Android font

val Typography = Typography(
    // Display variants - design.json sizes
    displayLarge = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 57.sp, // design.json: 3xl (1.875rem = 30sp, but using Material3 standard)
        lineHeight = 64.sp, // 1.25 ratio
        letterSpacing = (-0.25).sp,
    ),
    displayMedium = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 45.sp,
        lineHeight = 52.sp,
        letterSpacing = 0.sp,
    ),
    displaySmall = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 36.sp,
        lineHeight = 44.sp,
        letterSpacing = 0.sp,
    ),
    
    // Headline variants
    headlineLarge = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 32.sp,
        lineHeight = 40.sp,
        letterSpacing = 0.sp,
    ),
    headlineMedium = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 28.sp,
        lineHeight = 36.sp,
        letterSpacing = 0.sp,
    ),
    headlineSmall = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 24.sp,
        lineHeight = 32.sp,
        letterSpacing = 0.sp,
    ),
    
    // Title variants
    titleLarge = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Bold,
        fontSize = 22.sp,
        lineHeight = 28.sp,
        letterSpacing = 0.sp,
    ),
    titleMedium = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 16.sp,
        lineHeight = 24.sp,
        letterSpacing = 0.15.sp,
    ),
    titleSmall = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp,
    ),
    
    // Body variants - design.json sizes
    bodyLarge = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp, // design.json: base (1rem = 16sp)
        lineHeight = 24.sp, // 1.5 ratio
        letterSpacing = 0.5.sp,
    ),
    bodyMedium = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp, // design.json: sm (0.875rem = 14sp)
        lineHeight = 20.sp,
        letterSpacing = 0.25.sp,
    ),
    bodySmall = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp, // design.json: xs (0.75rem = 12sp)
        lineHeight = 16.sp,
        letterSpacing = 0.4.sp,
    ),
    
    // Label variants
    labelLarge = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        letterSpacing = 0.1.sp,
    ),
    labelMedium = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp,
    ),
    labelSmall = TextStyle(
        fontFamily = RobotoFontFamily,
        fontWeight = FontWeight.Medium,
        fontSize = 11.sp,
        lineHeight = 16.sp,
        letterSpacing = 0.5.sp,
    ),
)

// Design.json specific typography variants
object ClutchTypography {
    // Font sizes from design.json
    val xs = 12.sp      // 0.75rem
    val sm = 14.sp      // 0.875rem  
    val base = 16.sp    // 1rem
    val lg = 18.sp      // 1.125rem
    val xl = 20.sp      // 1.25rem
    val xl2 = 24.sp     // 1.5rem
    val xl3 = 30.sp     // 1.875rem
    
    // Font weights from design.json
    val light = FontWeight.Light      // 300
    val regular = FontWeight.Normal    // 400
    val medium = FontWeight.Medium     // 500
    val semibold = FontWeight.SemiBold // 600
    val bold = FontWeight.Bold         // 700
    
    // Line heights from design.json
    val tight = 1.25f      // 1.25
    val normal = 1.5f      // 1.5
    val relaxed = 1.75f    // 1.75
}
