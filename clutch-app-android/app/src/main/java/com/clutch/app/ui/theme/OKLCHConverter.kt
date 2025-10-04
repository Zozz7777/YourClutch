package com.clutch.app.ui.theme

import androidx.compose.ui.graphics.Color
import kotlin.math.*

/**
 * OKLCH to RGB Color Converter for Android
 * 
 * This class provides accurate conversion from OKLCH color space (used in design.json)
 * to RGB color space (used in Android/Jetpack Compose).
 * 
 * Based on the proven algorithms from the OKLCH picker tool and Culori library.
 * 
 * OKLCH format: oklch(lightness chroma hue)
 * - Lightness: 0.0 to 1.0 (0% to 100%)
 * - Chroma: 0.0 to 0.4+ (saturation)
 * - Hue: 0.0 to 360.0 (degrees)
 */
object OKLCHConverter {
    
    /**
     * Convert OKLCH values to Android Color
     * @param lightness Lightness value (0.0 to 1.0)
     * @param chroma Chroma value (0.0 to 0.4+)
     * @param hue Hue value (0.0 to 360.0 degrees)
     * @return Android Color object
     */
    fun oklchToColor(lightness: Double, chroma: Double, hue: Double): Color {
        val rgb = oklchToRgb(lightness, chroma, hue)
        return Color(
            red = rgb.red,
            green = rgb.green,
            blue = rgb.blue,
            alpha = 1.0f
        )
    }
    
    /**
     * Convert OKLCH string to Android Color
     * @param oklchString OKLCH string like "oklch(0.5770 0.2450 27.3250)"
     * @return Android Color object
     */
    fun oklchStringToColor(oklchString: String): Color {
        val values = parseOKLCHString(oklchString)
        return oklchToColor(values.first, values.second, values.third)
    }
    
    /**
     * Parse OKLCH string into individual values
     */
    private fun parseOKLCHString(oklchString: String): Triple<Double, Double, Double> {
        val cleanString = oklchString
            .replace("oklch(", "")
            .replace(")", "")
            .trim()
        
        val values = cleanString.split("\\s+".toRegex())
            .map { it.toDouble() }
        
        return Triple(values[0], values[1], values[2])
    }
    
    /**
     * Convert OKLCH to RGB using the official OKLCH to RGB conversion algorithm
     * Based on the Oklab color space paper and Culori library implementation
     */
    private fun oklchToRgb(lightness: Double, chroma: Double, hue: Double): RGB {
        // Convert OKLCH to OKLab
        val lab = oklchToOklab(lightness, chroma, hue)
        
        // Convert OKLab to Linear RGB
        val linearRgb = oklabToLinearRgb(lab)
        
        // Convert Linear RGB to sRGB
        val srgb = linearRgbToSrgb(linearRgb)
        
        return srgb
    }
    
    /**
     * Convert OKLCH to OKLab color space
     */
    private fun oklchToOklab(lightness: Double, chroma: Double, hue: Double): OKLab {
        val hueRadians = Math.toRadians(hue)
        val a = chroma * cos(hueRadians)
        val b = chroma * sin(hueRadians)
        
        return OKLab(lightness, a, b)
    }
    
    /**
     * Convert OKLab to Linear RGB using the official transformation matrix
     * From: "A perceptual color space for image processing" by Björn Ottosson
     */
    private fun oklabToLinearRgb(lab: OKLab): LinearRGB {
        val l = lab.l
        val a = lab.a
        val b = lab.b
        
        // OKLab to Linear RGB transformation matrix
        val l_ = l + 0.3963377774 * a + 0.2158037573 * b
        val m_ = l - 0.1055613458 * a - 0.0638541728 * b
        val s_ = l - 0.0894841775 * a - 1.2914855480 * b
        
        // Apply cube root (gamma correction)
        val l3 = l_ * l_ * l_
        val m3 = m_ * m_ * m_
        val s3 = s_ * s_ * s_
        
        // Apply final transformation matrix
        val r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
        val g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3
        val blue = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3
        
        return LinearRGB(r, g, blue)
    }
    
    /**
     * Convert Linear RGB to sRGB using the standard sRGB gamma correction
     */
    private fun linearRgbToSrgb(linearRgb: LinearRGB): RGB {
        fun linearToSrgb(c: Double): Double {
            return if (c <= 0.0031308) {
                12.92 * c
            } else {
                1.055 * c.pow(1.0 / 2.4) - 0.055
            }
        }
        
        val r = linearToSrgb(linearRgb.r).coerceIn(0.0, 1.0).toFloat()
        val g = linearToSrgb(linearRgb.g).coerceIn(0.0, 1.0).toFloat()
        val b = linearToSrgb(linearRgb.b).coerceIn(0.0, 1.0).toFloat()
        
        return RGB(r, g, b)
    }
    
    /**
     * Data classes for color space representations
     */
    private data class OKLab(val l: Double, val a: Double, val b: Double)
    private data class LinearRGB(val r: Double, val g: Double, val b: Double)
    private data class RGB(val red: Float, val green: Float, val blue: Float)
}

/**
 * Extension function to create Color from OKLCH string
 */
fun String.toColorFromOKLCH(): Color {
    return OKLCHConverter.oklchStringToColor(this)
}

/**
 * Extension function to create Color from OKLCH values
 */
fun Triple<Double, Double, Double>.toColorFromOKLCH(): Color {
    return OKLCHConverter.oklchToColor(first, second, third)
}

