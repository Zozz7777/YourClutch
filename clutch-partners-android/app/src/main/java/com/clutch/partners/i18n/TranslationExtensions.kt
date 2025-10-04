package com.clutch.partners.i18n

import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import com.clutch.partners.utils.LanguageManager

@Composable
fun String.translate(): String {
    return TranslationManager.getString(this)
}

@Composable
fun getTranslatedString(key: String): String {
    return TranslationManager.getString(key)
}

@Composable
fun isRTL(): Boolean {
    val context = LocalContext.current
    return LanguageManager.isRTL(context)
}

@Composable
fun getCurrentLanguage(): String {
    val context = LocalContext.current
    return LanguageManager.getSupportedLanguage(context)
}
