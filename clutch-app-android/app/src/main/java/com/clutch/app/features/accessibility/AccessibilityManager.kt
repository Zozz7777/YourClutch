package com.clutch.app.features.accessibility

import android.content.Context
import android.content.res.Configuration
import android.view.accessibility.AccessibilityManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

/**
 * AccessibilityManager.kt - Accessibility support manager
 * 
 * Handles accessibility features, screen reader support, and accessibility preferences.
 */

@Singleton
class AccessibilityManager @Inject constructor(
    private val context: Context
) {
    private val _accessibilityState = MutableStateFlow(AccessibilityState())
    val accessibilityState: StateFlow<AccessibilityState> = _accessibilityState.asStateFlow()

    private val accessibilityManager = context.getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager

    init {
        updateAccessibilityState()
    }

    private fun updateAccessibilityState() {
        val isScreenReaderEnabled = accessibilityManager.isEnabled
        val isTouchExplorationEnabled = accessibilityManager.isTouchExplorationEnabled
        val isHighContrastEnabled = checkHighContrastEnabled()
        val isLargeTextEnabled = checkLargeTextEnabled()
        val isReduceMotionEnabled = checkReduceMotionEnabled()

        _accessibilityState.value = AccessibilityState(
            isScreenReaderEnabled = isScreenReaderEnabled,
            isTouchExplorationEnabled = isTouchExplorationEnabled,
            isHighContrastEnabled = isHighContrastEnabled,
            isLargeTextEnabled = isLargeTextEnabled,
            isReduceMotionEnabled = isReduceMotionEnabled
        )
    }

    private fun checkHighContrastEnabled(): Boolean {
        val configuration = context.resources.configuration
        return configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK == Configuration.UI_MODE_NIGHT_YES
    }

    private fun checkLargeTextEnabled(): Boolean {
        val configuration = context.resources.configuration
        return configuration.fontScale > 1.0f
    }

    private fun checkReduceMotionEnabled(): Boolean {
        // This would typically check system settings for reduced motion
        // For now, we'll return false as a default
        return false
    }

    fun isScreenReaderEnabled(): Boolean {
        return _accessibilityState.value.isScreenReaderEnabled
    }

    fun isTouchExplorationEnabled(): Boolean {
        return _accessibilityState.value.isTouchExplorationEnabled
    }

    fun isHighContrastEnabled(): Boolean {
        return _accessibilityState.value.isHighContrastEnabled
    }

    fun isLargeTextEnabled(): Boolean {
        return _accessibilityState.value.isLargeTextEnabled
    }

    fun isReduceMotionEnabled(): Boolean {
        return _accessibilityState.value.isReduceMotionEnabled
    }

    fun getAccessibilityState(): AccessibilityState {
        return _accessibilityState.value
    }

    fun refreshAccessibilityState() {
        updateAccessibilityState()
    }

    fun isAccessibilityEnabled(): Boolean {
        return isScreenReaderEnabled() || isTouchExplorationEnabled()
    }

    fun getRecommendedTouchTargetSize(): Int {
        return if (isTouchExplorationEnabled()) {
            48 // 48dp minimum for touch exploration
        } else {
            44 // 44dp minimum for regular touch
        }
    }

    fun getRecommendedTextSize(): Float {
        return if (isLargeTextEnabled()) {
            1.2f // 20% larger text
        } else {
            1.0f // Normal text size
        }
    }

    fun getRecommendedAnimationDuration(): Long {
        return if (isReduceMotionEnabled()) {
            0L // No animation
        } else {
            300L // Normal animation duration
        }
    }
}

data class AccessibilityState(
    val isScreenReaderEnabled: Boolean = false,
    val isTouchExplorationEnabled: Boolean = false,
    val isHighContrastEnabled: Boolean = false,
    val isLargeTextEnabled: Boolean = false,
    val isReduceMotionEnabled: Boolean = false
)
