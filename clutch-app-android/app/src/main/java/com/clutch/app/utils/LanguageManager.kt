package com.clutch.app.utils

import android.content.Context
import android.content.SharedPreferences
import java.util.Locale

object LanguageManager {
    private const val PREFS_NAME = "clutch_language_prefs"
    private const val KEY_LANGUAGE = "language"
    
    const val LANG_ENGLISH = "en"
    const val LANG_ARABIC = "ar"
    const val LANG_FRENCH = "fr"
    const val LANG_SPANISH = "es"
    
    private var prefs: SharedPreferences? = null
    
    fun initialize(context: Context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }
    
    fun getCurrentLanguage(): String {
        return prefs?.getString(KEY_LANGUAGE, LANG_ENGLISH) ?: LANG_ENGLISH
    }
    
    fun setLanguage(language: String) {
        prefs?.edit()?.putString(KEY_LANGUAGE, language)?.apply()
    }
    
    fun getSystemLanguage(context: Context): String {
        val systemLocale = context.resources.configuration.locales[0]
        return when (systemLocale.language) {
            "ar" -> LANG_ARABIC
            "fr" -> LANG_FRENCH
            "es" -> LANG_SPANISH
            else -> LANG_ENGLISH
        }
    }
    
    fun getLanguageDisplayName(language: String): String {
        return when (language) {
            LANG_ENGLISH -> "English"
            LANG_ARABIC -> "العربية"
            LANG_FRENCH -> "Français"
            LANG_SPANISH -> "Español"
            else -> "English"
        }
    }
    
    fun getAvailableLanguages(): List<String> {
        return listOf(LANG_ENGLISH, LANG_ARABIC, LANG_FRENCH, LANG_SPANISH)
    }
}