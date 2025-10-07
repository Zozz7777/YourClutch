package com.clutch.partners.utils

import android.content.Context
import androidx.activity.ComponentActivity

object ThemeManager {
    private const val THEME_PREF_KEY = "selected_theme"
    private const val AUTO_DETECT_THEME_KEY = "auto_detect_theme"
    private const val LIGHT_THEME = "light"
    private const val DARK_THEME = "dark"
    private const val AUTO_THEME = "auto"
    
    fun getSelectedTheme(context: Context): String {
        val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        val isAutoDetect = prefs.getBoolean(AUTO_DETECT_THEME_KEY, true)
        
        return if (isAutoDetect) {
            detectSystemTheme(context)
        } else {
            prefs.getString(THEME_PREF_KEY, LIGHT_THEME) ?: LIGHT_THEME
        }
    }
    
    fun detectSystemTheme(context: Context): String {
        val nightModeFlags = context.resources.configuration.uiMode and 
            android.content.res.Configuration.UI_MODE_NIGHT_MASK
        return when (nightModeFlags) {
            android.content.res.Configuration.UI_MODE_NIGHT_YES -> DARK_THEME
            android.content.res.Configuration.UI_MODE_NIGHT_NO -> LIGHT_THEME
            else -> LIGHT_THEME // Default to light theme
        }
    }
    
    fun isDarkTheme(context: Context): Boolean {
        return getSelectedTheme(context) == DARK_THEME
    }
    
    fun isAutoDetectEnabled(context: Context): Boolean {
        val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        return prefs.getBoolean(AUTO_DETECT_THEME_KEY, true)
    }
    
    fun enableAutoDetect(context: Context) {
        val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        prefs.edit().putBoolean(AUTO_DETECT_THEME_KEY, true).apply()
    }
    
    fun toggleTheme(context: Context) {
        val currentTheme = getSelectedTheme(context)
        val newTheme = if (currentTheme == LIGHT_THEME) DARK_THEME else LIGHT_THEME
        setTheme(context, newTheme)
    }
    
    fun setTheme(context: Context, theme: String) {
        val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        prefs.edit()
            .putString(THEME_PREF_KEY, theme)
            .putBoolean(AUTO_DETECT_THEME_KEY, false)
            .apply()
    }
}
