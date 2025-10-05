package com.clutch.partners.security

import android.content.Context
import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyStore
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class EncryptionManager @Inject constructor(
    private val context: Context
) {
    private val keyStore = KeyStore.getInstance("AndroidKeyStore")
    private val keyAlias = "ClutchPartnersKey"
    
    init {
        keyStore.load(null)
        generateKey()
    }
    
    private fun generateKey() {
        if (!keyStore.containsAlias(keyAlias)) {
            val keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore")
            val keyGenParameterSpec = KeyGenParameterSpec.Builder(
                keyAlias,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setUserAuthenticationRequired(false)
                .setRandomizedEncryptionRequired(true)
                .build()
            
            keyGenerator.init(keyGenParameterSpec)
            keyGenerator.generateKey()
        }
    }
    
    fun encrypt(data: String): EncryptedData {
        val secretKey = keyStore.getKey(keyAlias, null) as SecretKey
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, secretKey)
        
        val encryptedBytes = cipher.doFinal(data.toByteArray())
        val iv = cipher.iv
        
        return EncryptedData(
            encryptedData = encryptedBytes,
            iv = iv
        )
    }
    
    fun decrypt(encryptedData: EncryptedData): String {
        val secretKey = keyStore.getKey(keyAlias, null) as SecretKey
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        val spec = GCMParameterSpec(128, encryptedData.iv)
        cipher.init(Cipher.DECRYPT_MODE, secretKey, spec)
        
        val decryptedBytes = cipher.doFinal(encryptedData.encryptedData)
        return String(decryptedBytes)
    }
    
    fun encryptSensitiveData(data: String): String {
        val encryptedData = encrypt(data)
        return "${android.util.Base64.encodeToString(encryptedData.iv, android.util.Base64.DEFAULT)}:${android.util.Base64.encodeToString(encryptedData.encryptedData, android.util.Base64.DEFAULT)}"
    }
    
    fun decryptSensitiveData(encryptedString: String): String {
        val parts = encryptedString.split(":")
        if (parts.size != 2) throw IllegalArgumentException("Invalid encrypted data format")
        
        val iv = android.util.Base64.decode(parts[0], android.util.Base64.DEFAULT)
        val encryptedData = android.util.Base64.decode(parts[1], android.util.Base64.DEFAULT)
        
        return decrypt(EncryptedData(encryptedData, iv))
    }
}

data class EncryptedData(
    val encryptedData: ByteArray,
    val iv: ByteArray
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        
        other as EncryptedData
        
        if (!encryptedData.contentEquals(other.encryptedData)) return false
        if (!iv.contentEquals(other.iv)) return false
        
        return true
    }
    
    override fun hashCode(): Int {
        var result = encryptedData.contentHashCode()
        result = 31 * result + iv.contentHashCode()
        return result
    }
}
