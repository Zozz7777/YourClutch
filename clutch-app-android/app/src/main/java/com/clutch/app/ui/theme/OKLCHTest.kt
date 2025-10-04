package com.clutch.app.ui.theme

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb

/**
 * OKLCH Conversion Test
 * 
 * This file contains test functions to verify that our OKLCH to RGB conversion
 * is working correctly and producing accurate colors.
 */
object OKLCHTest {
    
    /**
     * Test the primary color conversion from design.json
     * Expected: oklch(0.5770 0.2450 27.3250) should produce a red color
     */
    fun testPrimaryColor(): Boolean {
        val primaryColor = "oklch(0.5770 0.2450 27.3250)".toColorFromOKLCH()
        val argb = primaryColor.toArgb()
        
        // Extract RGB components
        val red = (argb shr 16) and 0xFF
        val green = (argb shr 8) and 0xFF
        val blue = argb and 0xFF
        
        // Primary color should be red (high red, low green, low blue)
        val isRed = red > 200 && green < 50 && blue < 50
        
        println("Primary Color Test:")
        println("  OKLCH: oklch(0.5770 0.2450 27.3250)")
        println("  RGB: ($red, $green, $blue)")
        println("  ARGB: 0x${argb.toString(16).uppercase()}")
        println("  Is Red: $isRed")
        
        return isRed
    }
    
    /**
     * Test white color conversion
     * Expected: oklch(1 0 0) should produce white
     */
    fun testWhiteColor(): Boolean {
        val whiteColor = "oklch(1 0 0)".toColorFromOKLCH()
        val argb = whiteColor.toArgb()
        
        // Extract RGB components
        val red = (argb shr 16) and 0xFF
        val green = (argb shr 8) and 0xFF
        val blue = argb and 0xFF
        
        // White should have high values for all components
        val isWhite = red > 240 && green > 240 && blue > 240
        
        println("White Color Test:")
        println("  OKLCH: oklch(1 0 0)")
        println("  RGB: ($red, $green, $blue)")
        println("  ARGB: 0x${argb.toString(16).uppercase()}")
        println("  Is White: $isWhite")
        
        return isWhite
    }
    
    /**
     * Test black color conversion
     * Expected: oklch(0 0 0) should produce black
     */
    fun testBlackColor(): Boolean {
        val blackColor = "oklch(0 0 0)".toColorFromOKLCH()
        val argb = blackColor.toArgb()
        
        // Extract RGB components
        val red = (argb shr 16) and 0xFF
        val green = (argb shr 8) and 0xFF
        val blue = argb and 0xFF
        
        // Black should have low values for all components
        val isBlack = red < 20 && green < 20 && blue < 20
        
        println("Black Color Test:")
        println("  OKLCH: oklch(0 0 0)")
        println("  RGB: ($red, $green, $blue)")
        println("  ARGB: 0x${argb.toString(16).uppercase()}")
        println("  Is Black: $isBlack")
        
        return isBlack
    }
    
    /**
     * Test success color conversion
     * Expected: oklch(0.72 0.2 145) should produce a green color
     */
    fun testSuccessColor(): Boolean {
        val successColor = "oklch(0.72 0.2 145)".toColorFromOKLCH()
        val argb = successColor.toArgb()
        
        // Extract RGB components
        val red = (argb shr 16) and 0xFF
        val green = (argb shr 8) and 0xFF
        val blue = argb and 0xFF
        
        // Success color should be green (low red, high green, low blue)
        val isGreen = red < 100 && green > 150 && blue < 100
        
        println("Success Color Test:")
        println("  OKLCH: oklch(0.72 0.2 145)")
        println("  RGB: ($red, $green, $blue)")
        println("  ARGB: 0x${argb.toString(16).uppercase()}")
        println("  Is Green: $isGreen")
        
        return isGreen
    }
    
    /**
     * Test all color conversions
     */
    fun runAllTests(): Boolean {
        println("=== OKLCH Conversion Tests ===")
        println()
        
        val primaryTest = testPrimaryColor()
        println()
        
        val whiteTest = testWhiteColor()
        println()
        
        val blackTest = testBlackColor()
        println()
        
        val successTest = testSuccessColor()
        println()
        
        val allPassed = primaryTest && whiteTest && blackTest && successTest
        
        println("=== Test Results ===")
        println("Primary Color: ${if (primaryTest) "PASS" else "FAIL"}")
        println("White Color: ${if (whiteTest) "PASS" else "FAIL"}")
        println("Black Color: ${if (blackTest) "PASS" else "FAIL"}")
        println("Success Color: ${if (successTest) "PASS" else "FAIL"}")
        println("Overall: ${if (allPassed) "ALL TESTS PASSED" else "SOME TESTS FAILED"}")
        
        return allPassed
    }
    
    /**
     * Compare with old hardcoded values
     */
    fun compareWithOldValues() {
        println("=== Comparison with Old Hardcoded Values ===")
        println()
        
        // Old hardcoded primary color
        val oldPrimary = Color(0xFFE60000)
        val newPrimary = "oklch(0.5770 0.2450 27.3250)".toColorFromOKLCH()
        
        println("Primary Color Comparison:")
        println("  Old (hardcoded): 0x${oldPrimary.toArgb().toString(16).uppercase()}")
        println("  New (OKLCH): 0x${newPrimary.toArgb().toString(16).uppercase()}")
        println("  Difference: ${kotlin.math.abs(oldPrimary.toArgb() - newPrimary.toArgb())}")
        println()
        
        // Old hardcoded white
        val oldWhite = Color(0xFFFFFFFF)
        val newWhite = "oklch(1 0 0)".toColorFromOKLCH()
        
        println("White Color Comparison:")
        println("  Old (hardcoded): 0x${oldWhite.toArgb().toString(16).uppercase()}")
        println("  New (OKLCH): 0x${newWhite.toArgb().toString(16).uppercase()}")
        println("  Difference: ${kotlin.math.abs(oldWhite.toArgb() - newWhite.toArgb())}")
        println()
    }
}
