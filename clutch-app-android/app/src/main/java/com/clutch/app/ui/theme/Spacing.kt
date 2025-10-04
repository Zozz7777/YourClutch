package com.clutch.app.ui.theme

import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * Spacing.kt - Perfect design.json compliance
 * 
 * This file implements the exact spacing specifications from design.json
 * with pixel-perfect spacing values and density support.
 * 
 * All spacing now matches design.json specifications 100%.
 */

// ============================================================================
// DESIGN.JSON SPACING SYSTEM (100% accurate)
// ============================================================================

/**
 * Base spacing unit from design.json: 0.25rem = 4dp
 */
object ClutchSpacing {
    // Base spacing unit (0.25rem = 4dp)
    val base = 4.dp
    
    // Spacing scale based on design.json
    val xs = 2.dp      // 0.125rem
    val sm = 4.dp      // 0.25rem (base)
    val md = 8.dp      // 0.5rem
    val lg = 12.dp     // 0.75rem
    val xl = 16.dp     // 1rem
    val xl2 = 20.dp    // 1.25rem
    val xl3 = 24.dp    // 1.5rem
    val xl4 = 32.dp    // 2rem
    val xl5 = 40.dp    // 2.5rem
    val xl6 = 48.dp    // 3rem
    val xl7 = 56.dp    // 3.5rem
    val xl8 = 64.dp    // 4rem
    val xl9 = 72.dp    // 4.5rem
    val xl10 = 80.dp   // 5rem
    val xl11 = 88.dp   // 5.5rem
    val xl12 = 96.dp   // 6rem
}

// ============================================================================
// DENSITY SUPPORT (from design.json)
// ============================================================================

/**
 * Density-based spacing for comfortable and compact modes
 */
object ClutchDensity {
    // Comfortable density (design.json)
    object Comfortable {
        val padding = 16.dp      // 1rem
        val rowHeight = 48.dp     // 3rem
        val cardPadding = 20.dp   // 1.25rem
        val sectionSpacing = 24.dp // 1.5rem
    }
    
    // Compact density (design.json)
    object Compact {
        val padding = 8.dp        // 0.5rem
        val rowHeight = 36.dp     // 2.25rem
        val cardPadding = 12.dp   // 0.75rem
        val sectionSpacing = 16.dp // 1rem
    }
}

// ============================================================================
// COMPONENT SPACING (design.json compliant)
// ============================================================================

/**
 * Component-specific spacing for consistent design
 */
object ClutchComponentSpacing {
    // Card spacing
    val cardPadding = 20.dp       // 1.25rem
    val cardMargin = 16.dp        // 1rem
    val cardSpacing = 16.dp       // 1rem
    
    // Button spacing
    val buttonPadding = 16.dp     // 1rem
    val buttonSpacing = 12.dp     // 0.75rem
    val buttonHeight = 48.dp      // 3rem
    
    // Input spacing
    val inputPadding = 12.dp      // 0.75rem
    val inputSpacing = 8.dp       // 0.5rem
    val inputHeight = 48.dp       // 3rem
    
    // List spacing
    val listItemPadding = 16.dp   // 1rem
    val listItemSpacing = 8.dp    // 0.5rem
    val listItemHeight = 56.dp    // 3.5rem
    
    // Navigation spacing
    val navPadding = 16.dp        // 1rem
    val navSpacing = 8.dp         // 0.5rem
    val navHeight = 64.dp         // 4rem
    
    // Section spacing
    val sectionPadding = 24.dp    // 1.5rem
    val sectionSpacing = 32.dp    // 2rem
    val sectionMargin = 16.dp     // 1rem
}

// ============================================================================
// LAYOUT SPACING (design.json compliant)
// ============================================================================

/**
 * Layout-specific spacing for consistent design
 */
object ClutchLayoutSpacing {
    // Screen spacing
    val screenPadding = 24.dp     // 1.5rem
    val screenMargin = 16.dp      // 1rem
    val screenSpacing = 32.dp     // 2rem
    
    // Grid spacing
    val gridSpacing = 16.dp       // 1rem
    val gridPadding = 20.dp       // 1.25rem
    val gridMargin = 16.dp        // 1rem
    
    // Flex spacing
    val flexSpacing = 12.dp       // 0.75rem
    val flexPadding = 16.dp        // 1rem
    val flexMargin = 8.dp         // 0.5rem
    
    // Stack spacing
    val stackSpacing = 8.dp       // 0.5rem
    val stackPadding = 16.dp      // 1rem
    val stackMargin = 12.dp       // 0.75rem
}

// ============================================================================
// BORDER RADIUS (from design.json)
// ============================================================================

/**
 * Border radius values from design.json: 0.625rem = 10dp
 */
object ClutchBorderRadius {
    val base = 10.dp              // 0.625rem (design.json)
    val sm = 6.dp                 // 0.375rem
    val md = 10.dp                // 0.625rem (base)
    val lg = 12.dp                // 0.75rem
    val xl = 16.dp                // 1rem
    val xl2 = 20.dp               // 1.25rem
    val xl3 = 24.dp               // 1.5rem
    val full = 999.dp             // Fully rounded
}

// ============================================================================
// SHADOW ELEVATION (from design.json)
// ============================================================================

/**
 * Shadow elevation values from design.json
 */
object ClutchElevation {
    val none = 0.dp
    val xs = 1.dp                 // 2xs shadow
    val sm = 2.dp                 // sm shadow
    val md = 4.dp                 // md shadow
    val lg = 8.dp
    val xl = 12.dp
    val xl2 = 16.dp
    val xl3 = 20.dp
    val xl4 = 24.dp
}

// ============================================================================
// Z-INDEX (from design.json)
// ============================================================================

/**
 * Z-index values from design.json
 */
object ClutchZIndex {
    val base = 0
    val dropdown = 1000
    val sticky = 1100
    val modal = 1200
    val popover = 1300
    val tooltip = 1400
}

// ============================================================================
// MOTION DURATION (from design.json)
// ============================================================================

/**
 * Motion duration values from design.json
 */
object ClutchMotion {
    val fast = 150L               // 150ms
    val normal = 300L             // 300ms
    val slow = 500L               // 500ms
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Utility functions for spacing calculations
 */
object ClutchSpacingUtils {
    /**
     * Calculate responsive spacing based on screen density
     */
    fun responsiveSpacing(baseSpacing: Dp, density: Float = 1.0f): Dp {
        return (baseSpacing.value * density).dp
    }
    
    /**
     * Calculate spacing for different screen sizes
     */
    fun adaptiveSpacing(
        small: Dp,
        medium: Dp,
        large: Dp,
        screenWidth: Dp
    ): Dp {
        return when {
            screenWidth < 600.dp -> small
            screenWidth < 840.dp -> medium
            else -> large
        }
    }
    
    /**
     * Calculate consistent spacing for components
     */
    fun componentSpacing(
        padding: Dp = ClutchComponentSpacing.cardPadding,
        margin: Dp = ClutchComponentSpacing.cardMargin,
        spacing: Dp = ClutchComponentSpacing.cardSpacing
    ): Triple<Dp, Dp, Dp> {
        return Triple(padding, margin, spacing)
    }
}
