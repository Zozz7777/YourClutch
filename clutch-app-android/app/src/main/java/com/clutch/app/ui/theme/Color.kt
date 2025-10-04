package com.clutch.app.ui.theme

import androidx.compose.ui.graphics.Color

/**
 * Color.kt - Updated to use accurate OKLCH-converted colors from design.json
 * 
 * This file now uses the OKLCHConverter to accurately convert design.json OKLCH values
 * to Android RGB colors for pixel-perfect design system compliance.
 * 
 * All colors are now 100% compliant with design.json specifications.
 */

// ============================================================================
// LIGHT THEME COLORS (accurately converted from design.json OKLCH)
// ============================================================================

// Background Colors
val LightBackground = "oklch(1 0 0)".toColorFromOKLCH() // Main background color
val LightForeground = "oklch(0.1450 0 0)".toColorFromOKLCH() // Main text and icon color
val LightCard = "oklch(1 0 0)".toColorFromOKLCH() // Background color for cards and containers
val LightCardForeground = "oklch(0.1450 0 0)".toColorFromOKLCH() // Text color on cards

// Primary Colors
val LightPrimary = "oklch(0.5770 0.2450 27.3250)".toColorFromOKLCH() // Primary brand color
val LightPrimaryForeground = "oklch(0.9850 0 0)".toColorFromOKLCH() // Text color on primary-colored elements
val LightSecondary = "oklch(0.5770 0.2450 27.3250)".toColorFromOKLCH() // Secondary color

// Muted Colors
val LightMuted = "oklch(0.9700 0 0)".toColorFromOKLCH() // Light, muted color for backgrounds and dividers
val LightMutedForeground = "oklch(0.5560 0 0)".toColorFromOKLCH() // Text color on muted backgrounds

// Action Colors
val LightDestructive = "oklch(0.5770 0.2450 27.3250)".toColorFromOKLCH() // Color for destructive actions
val LightBorder = "oklch(0.9220 0 0)".toColorFromOKLCH() // Border color for elements
val LightInput = "oklch(0.9220 0 0)".toColorFromOKLCH() // Background color for input fields
val LightRing = "oklch(0.7080 0 0)".toColorFromOKLCH() // Ring color for focus states

// Sidebar Colors
val LightSidebar = "oklch(0.9850 0 0)".toColorFromOKLCH() // Background color for the sidebar
val LightSidebarPrimary = "oklch(0.2050 0 0)".toColorFromOKLCH() // Primary color within the sidebar

// Status Colors
val LightSuccess = "oklch(0.72 0.2 145)".toColorFromOKLCH() // Success messages, confirmations, completed states
val LightWarning = "oklch(0.85 0.18 75)".toColorFromOKLCH() // Warnings, alerts, pending actions
val LightInfo = "oklch(0.75 0.1 220)".toColorFromOKLCH() // Informational messages, tooltips

// ============================================================================
// DARK THEME COLORS (accurately converted from design.json OKLCH)
// ============================================================================

// Background Colors
val DarkBackground = "oklch(0.1450 0 0)".toColorFromOKLCH() // Main background color for dark mode
val DarkForeground = "oklch(0.9850 0 0)".toColorFromOKLCH() // Main text and icon color for dark mode
val DarkCard = "oklch(0.2050 0 0)".toColorFromOKLCH() // Background color for cards in dark mode
val DarkCardForeground = "oklch(0.9710 0.0130 17.3800)".toColorFromOKLCH() // Text color on cards in dark mode

// Primary Colors
val DarkPrimary = "oklch(0.5050 0.2130 27.5180)".toColorFromOKLCH() // Primary brand color for dark mode
val DarkPrimaryForeground = "oklch(0.2050 0 0)".toColorFromOKLCH() // Text color on primary-colored elements in dark mode
val DarkSecondary = "oklch(0.2690 0 0)".toColorFromOKLCH() // Secondary color for dark mode

// Muted Colors
val DarkMuted = "oklch(0.2690 0 0)".toColorFromOKLCH() // Muted color for backgrounds in dark mode
val DarkMutedForeground = "oklch(0.5560 0 0)".toColorFromOKLCH() // Text color on muted backgrounds in dark mode

// Action Colors
val DarkDestructive = "oklch(0.7040 0.1910 22.2160)".toColorFromOKLCH() // Destructive color for dark mode
val DarkBorder = "oklch(0.2750 0 0)".toColorFromOKLCH() // Border color for dark mode
val DarkInput = "oklch(0.3250 0 0)".toColorFromOKLCH() // Input background color for dark mode
val DarkRing = "oklch(0.5560 0 0)".toColorFromOKLCH() // Ring color for focus states in dark mode

// Sidebar Colors
val DarkSidebar = "oklch(0.2050 0 0)".toColorFromOKLCH() // Background color for the sidebar in dark mode
val DarkSidebarPrimary = "oklch(0.5770 0.2450 27.3250)".toColorFromOKLCH() // Primary color within the sidebar for dark mode

// Status Colors (same for both themes as per design.json)
val DarkSuccess = "oklch(0.72 0.2 145)".toColorFromOKLCH() // Success messages, confirmations, completed states
val DarkWarning = "oklch(0.85 0.18 75)".toColorFromOKLCH() // Warnings, alerts, pending actions
val DarkInfo = "oklch(0.75 0.1 220)".toColorFromOKLCH() // Informational messages, tooltips

// ============================================================================
// CLUTCH BRAND COLORS (derived from primary colors)
// ============================================================================

// Main Clutch Red (from primary color)
val ClutchRed = LightPrimary // oklch(0.5770 0.2450 27.3250)

// Clutch Red Variants (calculated from primary with different lightness)
val ClutchRedLight = "oklch(0.7 0.2450 27.3250)".toColorFromOKLCH() // Lighter variant
val ClutchRedDark = "oklch(0.45 0.2450 27.3250)".toColorFromOKLCH() // Darker variant

// Clutch Gray Variants (from muted colors)
val ClutchGray = "oklch(0.6 0 0)".toColorFromOKLCH() // Medium gray
val ClutchGrayLight = "oklch(0.7 0 0)".toColorFromOKLCH() // Light gray
val ClutchGrayDark = "oklch(0.4 0 0)".toColorFromOKLCH() // Dark gray

// ============================================================================
// STATUS COLORS (from design.json)
// ============================================================================

val SuccessGreen = LightSuccess
val ErrorRed = LightDestructive
val WarningYellow = LightWarning
val InfoBlue = LightInfo

// ============================================================================
// GRADIENT COLORS (for visual effects)
// ============================================================================

val GradientStart = ClutchRed // Start with primary red
val GradientEnd = ClutchRedLight // End with lighter red variant


// ============================================================================
// SHADOW COLORS (from design.json)
// ============================================================================

// Shadow colors for design.json compliance
val Shadow2xs = Color(0x0D000000) // 0 1px 3px 0px hsl(0 0% 0% / 0.05)
val ShadowSm = Color(0x1A000000) // 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)
val ShadowMd = Color(0x1A000000) // 0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10)

// ============================================================================
// DESIGN SYSTEM UTILITIES
// ============================================================================

/**
 * Design system color utilities for 100% design.json compliance
 */
object ClutchColors {
    // Primary colors
    val primary = LightPrimary
    val primaryForeground = LightPrimaryForeground
    val secondary = LightSecondary
    
    // Background colors
    val background = LightBackground
    val foreground = LightForeground
    val card = LightCard
    val cardForeground = LightCardForeground
    
    // Muted colors
    val muted = LightMuted
    val mutedForeground = LightMutedForeground
    
    // Action colors
    val destructive = LightDestructive
    val border = LightBorder
    val input = LightInput
    val ring = LightRing
    
    // Sidebar colors
    val sidebar = LightSidebar
    val sidebarPrimary = LightSidebarPrimary
    
    // Status colors
    val success = LightSuccess
    val warning = LightWarning
    val info = LightInfo
    
    // Shadow colors
    val shadow2xs = Shadow2xs
    val shadowSm = ShadowSm
    val shadowMd = ShadowMd
}

/**
 * Dark theme color utilities
 */
object ClutchDarkColors {
    // Primary colors
    val primary = DarkPrimary
    val primaryForeground = DarkPrimaryForeground
    val secondary = DarkSecondary
    
    // Background colors
    val background = DarkBackground
    val foreground = DarkForeground
    val card = DarkCard
    val cardForeground = DarkCardForeground
    
    // Muted colors
    val muted = DarkMuted
    val mutedForeground = DarkMutedForeground
    
    // Action colors
    val destructive = DarkDestructive
    val border = DarkBorder
    val input = DarkInput
    val ring = DarkRing
    
    // Sidebar colors
    val sidebar = DarkSidebar
    val sidebarPrimary = DarkSidebarPrimary
    
    // Status colors (same for both themes)
    val success = DarkSuccess
    val warning = DarkWarning
    val info = DarkInfo
    
    // Shadow colors
    val shadow2xs = Shadow2xs
    val shadowSm = ShadowSm
    val shadowMd = ShadowMd
}
