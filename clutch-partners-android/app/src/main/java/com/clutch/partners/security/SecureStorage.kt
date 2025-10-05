package com.clutch.partners.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SecureStorage @Inject constructor(
    private val context: Context,
    private val encryptionManager: EncryptionManager
) {
    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()
    
    private val encryptedPrefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "clutch_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )
    
    fun storeSecureData(key: String, value: String) {
        encryptedPrefs.edit()
            .putString(key, value)
            .apply()
    }
    
    fun getSecureData(key: String): String? {
        return encryptedPrefs.getString(key, null)
    }
    
    fun storeEncryptedData(key: String, value: String) {
        val encryptedValue = encryptionManager.encryptSensitiveData(value)
        encryptedPrefs.edit()
            .putString(key, encryptedValue)
            .apply()
    }
    
    fun getEncryptedData(key: String): String? {
        val encryptedValue = encryptedPrefs.getString(key, null) ?: return null
        return try {
            encryptionManager.decryptSensitiveData(encryptedValue)
        } catch (e: Exception) {
            null
        }
    }
    
    fun removeSecureData(key: String) {
        encryptedPrefs.edit()
            .remove(key)
            .apply()
    }
    
    fun clearAllSecureData() {
        encryptedPrefs.edit()
            .clear()
            .apply()
    }
    
    fun containsSecureData(key: String): Boolean {
        return encryptedPrefs.contains(key)
    }
}
