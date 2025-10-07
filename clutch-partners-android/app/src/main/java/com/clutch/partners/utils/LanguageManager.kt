package com.clutch.partners.utils

import android.content.Context
import java.util.Locale

object LanguageManager {
    private const val LANGUAGE_PREF_KEY = "selected_language"
    private const val AUTO_DETECT_KEY = "auto_detect_language"
    private const val ARABIC_LANGUAGE = "ar"
    private const val ENGLISH_LANGUAGE = "en"
    
    fun isRTL(context: Context): Boolean {
        val language = getCurrentLanguage(context)
        return language == ARABIC_LANGUAGE
    }
    
    fun getCurrentLanguage(context: Context): String {
        val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        val isAutoDetect = prefs.getBoolean(AUTO_DETECT_KEY, true)
        
        return if (isAutoDetect) {
            detectSystemLanguage(context)
        } else {
            prefs.getString(LANGUAGE_PREF_KEY, ARABIC_LANGUAGE) ?: ARABIC_LANGUAGE
        }
    }
    
    fun detectSystemLanguage(context: Context): String {
        val systemLanguage = context.resources.configuration.locales[0].language
        return when (systemLanguage) {
            ARABIC_LANGUAGE -> ARABIC_LANGUAGE
            ENGLISH_LANGUAGE -> ENGLISH_LANGUAGE
            else -> ARABIC_LANGUAGE // Default to Arabic for unsupported languages
        }
    }
    
    fun setLanguage(context: Context, language: String) {
        val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        prefs.edit()
            .putString(LANGUAGE_PREF_KEY, language)
            .putBoolean(AUTO_DETECT_KEY, false)
            .apply()
    }
    
    fun enableAutoDetect(context: Context) {
        val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        prefs.edit().putBoolean(AUTO_DETECT_KEY, true).apply()
    }
    
    fun isAutoDetectEnabled(context: Context): Boolean {
        val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        return prefs.getBoolean(AUTO_DETECT_KEY, true)
    }
    
    fun getSupportedLanguage(context: Context): String {
        val language = getCurrentLanguage(context)
        return when (language) {
            ARABIC_LANGUAGE -> ARABIC_LANGUAGE
            ENGLISH_LANGUAGE -> ENGLISH_LANGUAGE
            else -> ARABIC_LANGUAGE // Default to Arabic
        }
    }
    
    fun toggleLanguage(context: Context): String {
        val currentLanguage = getCurrentLanguage(context)
        val newLanguage = if (currentLanguage == ARABIC_LANGUAGE) ENGLISH_LANGUAGE else ARABIC_LANGUAGE
        setLanguage(context, newLanguage)
        return newLanguage
    }
}
