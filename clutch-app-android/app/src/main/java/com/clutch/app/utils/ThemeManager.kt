package com.clutch.app.utils

import android.content.Context
import android.content.SharedPreferences

object ThemeManager {
    private const val PREFS_NAME = "clutch_theme_prefs"
    private const val KEY_THEME_MODE = "theme_mode"
    
    const val THEME_SYSTEM = "system"
    const val THEME_LIGHT = "light"
    const val THEME_DARK = "dark"
    
    private var prefs: SharedPreferences? = null
    
    fun initialize(context: Context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }
    
    fun getThemeMode(): String {
        return prefs?.getString(KEY_THEME_MODE, THEME_SYSTEM) ?: THEME_SYSTEM
    }
    
    fun setThemeMode(mode: String) {
        prefs?.edit()?.putString(KEY_THEME_MODE, mode)?.apply()
    }
    
    fun isDarkTheme(context: Context): Boolean {
        val mode = getThemeMode()
        return when (mode) {
            THEME_DARK -> true
            THEME_LIGHT -> false
            THEME_SYSTEM -> {
                val nightModeFlags = context.resources.configuration.uiMode and 
                    android.content.res.Configuration.UI_MODE_NIGHT_MASK
                nightModeFlags == android.content.res.Configuration.UI_MODE_NIGHT_YES
            }
            else -> false
        }
    }
}