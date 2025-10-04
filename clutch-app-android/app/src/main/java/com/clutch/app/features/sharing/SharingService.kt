package com.clutch.app.features.sharing

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SharingService @Inject constructor(
    private val context: Context
) {
    
    fun shareToWhatsApp(message: String) {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            setPackage("com.whatsapp")
            putExtra(Intent.EXTRA_TEXT, message)
        }
        context.startActivity(intent)
    }
    
    fun shareToFacebook(message: String) {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            setPackage("com.facebook.katana")
            putExtra(Intent.EXTRA_TEXT, message)
        }
        context.startActivity(intent)
    }
    
    fun shareToTwitter(message: String) {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            setPackage("com.twitter.android")
            putExtra(Intent.EXTRA_TEXT, message)
        }
        context.startActivity(intent)
    }
    
    fun shareToInstagram(message: String) {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            setPackage("com.instagram.android")
            putExtra(Intent.EXTRA_TEXT, message)
        }
        context.startActivity(intent)
    }
    
    fun shareViaEmail(message: String, subject: String = "Check out Clutch App") {
        val intent = Intent(Intent.ACTION_SENDTO).apply {
            data = Uri.parse("mailto:")
            putExtra(Intent.EXTRA_SUBJECT, subject)
            putExtra(Intent.EXTRA_TEXT, message)
        }
        context.startActivity(intent)
    }
    
    fun shareViaSMS(message: String) {
        val intent = Intent(Intent.ACTION_SENDTO).apply {
            data = Uri.parse("smsto:")
            putExtra("sms_body", message)
        }
        context.startActivity(intent)
    }
    
    fun copyToClipboard(message: String) {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
        val clip = android.content.ClipData.newPlainText("Clutch App", message)
        clipboard.setPrimaryClip(clip)
    }
    
    fun shareViaGeneric(message: String) {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, message)
        }
        val chooser = Intent.createChooser(intent, "Share Clutch App")
        context.startActivity(chooser)
    }
    
    fun generateReferralLink(referralCode: String): String {
        return "https://clutch.com/app?ref=$referralCode"
    }
    
    fun generateShareMessage(
        messageTemplate: String,
        referralCode: String,
        includeReferral: Boolean = true
    ): String {
        val referralLink = if (includeReferral) {
            generateReferralLink(referralCode)
        } else {
            "https://clutch.com/app"
        }
        
        return messageTemplate.replace("{referral_link}", referralLink)
            .replace("{referral_code}", referralCode)
    }
}
