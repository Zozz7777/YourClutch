package com.clutch.partners.utils

import android.content.Context
import android.content.res.Configuration
import java.util.Locale

object AppInitializer {
    
    fun initializeAppSettings(context: Context) {
        // Auto-detect and apply system language
        initializeLanguage(context)
        
        // Auto-detect and apply system theme
        initializeTheme(context)
    }
    
    private fun initializeLanguage(context: Context) {
        val systemLanguage = detectSystemLanguage(context)
        val currentLanguage = LanguageManager.getCurrentLanguage(context)
        
        // Only update if auto-detect is enabled and language is different
        if (LanguageManager.isAutoDetectEnabled(context) && currentLanguage != systemLanguage) {
            LanguageManager.setLanguage(context, systemLanguage)
        }
    }
    
    private fun initializeTheme(context: Context) {
        val systemTheme = detectSystemTheme(context)
        val currentTheme = ThemeManager.getSelectedTheme(context)
        
        // Only update if auto-detect is enabled and theme is different
        if (ThemeManager.isAutoDetectEnabled(context) && currentTheme != systemTheme) {
            ThemeManager.setTheme(context, systemTheme)
        }
    }
    
    private fun detectSystemLanguage(context: Context): String {
        val systemLanguage = context.resources.configuration.locales[0].language
        return when (systemLanguage) {
            "ar" -> "ar"
            "en" -> "en"
            else -> "ar" // Default to Arabic for unsupported languages
        }
    }
    
    private fun detectSystemTheme(context: Context): String {
        val nightModeFlags = context.resources.configuration.uiMode and 
            Configuration.UI_MODE_NIGHT_MASK
        return when (nightModeFlags) {
            Configuration.UI_MODE_NIGHT_YES -> "dark"
            Configuration.UI_MODE_NIGHT_NO -> "light"
            else -> "light" // Default to light theme
        }
    }
    
    fun getSystemLanguage(context: Context): String {
        return detectSystemLanguage(context)
    }
    
    fun getSystemTheme(context: Context): String {
        return detectSystemTheme(context)
    }
    
    fun isSystemRTL(context: Context): Boolean {
        val systemLanguage = context.resources.configuration.locales[0].language
        return systemLanguage == "ar"
    }
}
