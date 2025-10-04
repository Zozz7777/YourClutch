package com.clutch.partners.utils

import android.content.Context
import java.util.Locale

object LanguageManager {
    fun isRTL(context: Context): Boolean {
        val locale = context.resources.configuration.locales[0]
        return locale.language == "ar"
    }
    
    fun getCurrentLanguage(context: Context): String {
        return context.resources.configuration.locales[0].language
    }
    
    fun getSupportedLanguage(context: Context): String {
        val language = getCurrentLanguage(context)
        return when (language) {
            "ar" -> "ar"
            "en" -> "en"
            else -> "ar" // Default to Arabic
        }
    }
}