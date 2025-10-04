package com.clutch.app.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import java.util.concurrent.ConcurrentHashMap

/**
 * PerformanceOptimizations.kt - Advanced Performance Features
 * 
 * This file implements performance optimizations for the design system
 * including color caching, density calculations, and memory management.
 */

// ============================================================================
// COLOR CACHE SYSTEM (Performance Optimization)
// ============================================================================

/**
 * Thread-safe color cache for OKLCH color conversion performance
 */
object DesignSystemColorCache {
    private val colorCache = ConcurrentHashMap<String, Color>()
    private val maxCacheSize = 1000
    
    fun getColor(oklchString: String): Color {
        return colorCache.getOrPut(oklchString) {
            if (colorCache.size >= maxCacheSize) {
                // Clear oldest entries when cache is full
                val iterator = colorCache.entries.iterator()
                repeat(maxCacheSize / 2) {
                    if (iterator.hasNext()) {
                        iterator.next()
                        iterator.remove()
                    }
                }
            }
            oklchString.toColorFromOKLCH()
        }
    }
    
    fun clearCache() {
        colorCache.clear()
    }
    
    fun getCacheSize(): Int = colorCache.size
}

// ============================================================================
// DENSITY CALCULATIONS (Performance Optimization)
// ============================================================================

/**
 * Density-aware spacing calculations for optimal performance
 */
object DensityOptimizations {
    private val densityCache = ConcurrentHashMap<Float, Map<String, Dp>>()
    
    @Composable
    fun getOptimizedSpacing(density: Float): Map<String, Dp> {
        return remember(density) {
            densityCache.getOrPut(density) {
                mapOf(
                    "xs" to (2.dp * density),
                    "sm" to (4.dp * density),
                    "md" to (8.dp * density),
                    "lg" to (12.dp * density),
                    "xl" to (16.dp * density),
                    "xl2" to (20.dp * density),
                    "xl3" to (24.dp * density)
                )
            }
        }
    }
    
    fun clearDensityCache() {
        densityCache.clear()
    }
}

// ============================================================================
// MEMORY MANAGEMENT (Performance Optimization)
// ============================================================================

/**
 * Memory management utilities for design system performance
 */
object MemoryOptimizations {
    private var isLowMemoryMode = false
    
    fun setLowMemoryMode(enabled: Boolean) {
        isLowMemoryMode = enabled
        if (enabled) {
            // Clear caches in low memory mode
            DesignSystemColorCache.clearCache()
            DensityOptimizations.clearDensityCache()
        }
    }
    
    fun isLowMemoryMode(): Boolean = isLowMemoryMode
    
    @Composable
    fun getOptimizedColor(oklchString: String): Color {
        return if (isLowMemoryMode) {
            // Direct conversion without caching in low memory mode
            oklchString.toColorFromOKLCH()
        } else {
            // Use cache in normal mode
            DesignSystemColorCache.getColor(oklchString)
        }
    }
}

// ============================================================================
// RESPONSIVE DESIGN (Performance Optimization)
// ============================================================================

/**
 * Responsive design utilities for optimal performance across devices
 */
object ResponsiveOptimizations {
    private val screenSizeCache = ConcurrentHashMap<String, ScreenSize>()
    
    data class ScreenSize(
        val width: Dp,
        val height: Dp,
        val density: Float,
        val isTablet: Boolean,
        val isLandscape: Boolean
    )
    
    fun calculateScreenSize(
        width: Dp,
        height: Dp,
        density: Float
    ): ScreenSize {
        val key = "${width.value}x${height.value}x${density}"
        return screenSizeCache.getOrPut(key) {
            ScreenSize(
                width = width,
                height = height,
                density = density,
                isTablet = width >= 840.dp,
                isLandscape = width > height
            )
        }
    }
    
    @Composable
    fun getResponsiveSpacing(): Map<String, Dp> {
        val density = LocalDensity.current.density
        val screenSize = calculateScreenSize(
            width = 360.dp, // Default width
            height = 640.dp, // Default height
            density = density
        )
        
        return when {
            screenSize.isTablet -> {
                // Tablet spacing (larger)
                mapOf(
                    "xs" to 4.dp,
                    "sm" to 8.dp,
                    "md" to 16.dp,
                    "lg" to 24.dp,
                    "xl" to 32.dp,
                    "xl2" to 40.dp,
                    "xl3" to 48.dp
                )
            }
            screenSize.isLandscape -> {
                // Landscape spacing (medium)
                mapOf(
                    "xs" to 3.dp,
                    "sm" to 6.dp,
                    "md" to 12.dp,
                    "lg" to 18.dp,
                    "xl" to 24.dp,
                    "xl2" to 30.dp,
                    "xl3" to 36.dp
                )
            }
            else -> {
                // Portrait spacing (default)
                mapOf(
                    "xs" to 2.dp,
                    "sm" to 4.dp,
                    "md" to 8.dp,
                    "lg" to 12.dp,
                    "xl" to 16.dp,
                    "xl2" to 20.dp,
                    "xl3" to 24.dp
                )
            }
        }
    }
}

// ============================================================================
// COMPONENT OPTIMIZATION (Performance Optimization)
// ============================================================================

/**
 * Component optimization utilities for better performance
 */
object ComponentOptimizations {
    private val componentCache = ConcurrentHashMap<String, Any>()
    
    fun <T> getCachedComponent(key: String, factory: () -> T): T {
        @Suppress("UNCHECKED_CAST")
        return componentCache.getOrPut(key) { factory() } as T
    }
    
    fun clearComponentCache() {
        componentCache.clear()
    }
    
    fun getCacheSize(): Int = componentCache.size
}

// ============================================================================
// RENDERING OPTIMIZATION (Performance Optimization)
// ============================================================================

/**
 * Rendering optimization utilities for smooth performance
 */
object RenderingOptimizations {
    private var isHighRefreshRate = false
    private var targetFrameRate = 60f
    
    fun setHighRefreshRate(enabled: Boolean) {
        isHighRefreshRate = enabled
        targetFrameRate = if (enabled) 120f else 60f
    }
    
    fun isHighRefreshRate(): Boolean = isHighRefreshRate
    
    fun getTargetFrameRate(): Float = targetFrameRate
    
    @Composable
    fun getOptimizedAnimationDuration(): Long {
        return if (isHighRefreshRate) {
            // Faster animations for high refresh rate
            ClutchMotion.fast
        } else {
            // Normal animations for standard refresh rate
            ClutchMotion.normal
        }
    }
}

// ============================================================================
// PERFORMANCE MONITORING (Performance Optimization)
// ============================================================================

/**
 * Performance monitoring utilities for design system
 */
object PerformanceMonitoring {
    private var frameTime = 0L
    private var frameCount = 0L
    private var averageFrameTime = 0f
    
    fun recordFrameTime(time: Long) {
        frameTime = time
        frameCount++
        averageFrameTime = (averageFrameTime * (frameCount - 1) + time) / frameCount
    }
    
    fun getAverageFrameTime(): Float = averageFrameTime
    
    fun getFrameRate(): Float {
        return if (averageFrameTime > 0) {
            1000f / averageFrameTime
        } else {
            0f
        }
    }
    
    fun isPerformanceGood(): Boolean {
        return getFrameRate() >= 55f // 55+ FPS is considered good
    }
    
    fun resetMetrics() {
        frameTime = 0L
        frameCount = 0L
        averageFrameTime = 0f
    }
}

// ============================================================================
// MEMORY OPTIMIZATION (Performance Optimization)
// ============================================================================

/**
 * Memory optimization utilities for design system
 */
object MemoryOptimization {
    private var memoryUsage = 0L
    private var maxMemoryUsage = 0L
    
    fun recordMemoryUsage(usage: Long) {
        memoryUsage = usage
        if (usage > maxMemoryUsage) {
            maxMemoryUsage = usage
        }
    }
    
    fun getMemoryUsage(): Long = memoryUsage
    
    fun getMaxMemoryUsage(): Long = maxMemoryUsage
    
    fun isMemoryUsageHigh(): Boolean {
        return memoryUsage > 100 * 1024 * 1024 // 100MB threshold
    }
    
    fun optimizeMemoryUsage() {
        if (isMemoryUsageHigh()) {
            // Clear caches to free memory
            DesignSystemColorCache.clearCache()
            DensityOptimizations.clearDensityCache()
            ComponentOptimizations.clearComponentCache()
        }
    }
}
