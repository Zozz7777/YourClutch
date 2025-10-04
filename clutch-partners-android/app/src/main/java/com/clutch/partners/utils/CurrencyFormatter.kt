package com.clutch.partners.utils

import java.text.NumberFormat
import java.util.*

object CurrencyFormatter {
    private val egyptianLocale = Locale("ar", "EG")
    private val egyptianFormatter = NumberFormat.getCurrencyInstance(egyptianLocale)
    
    init {
        // Set Egyptian Pound as currency
        egyptianFormatter.currency = Currency.getInstance("EGP")
    }
    
    fun formatEGP(amount: Double): String {
        return egyptianFormatter.format(amount)
    }
    
    fun formatEGP(amount: Int): String {
        return egyptianFormatter.format(amount.toDouble())
    }
    
    fun formatEGP(amount: Long): String {
        return egyptianFormatter.format(amount.toDouble())
    }
    
    fun formatEGPShort(amount: Double): String {
        return when {
            amount >= 1_000_000 -> "₪${String.format("%.1f", amount / 1_000_000)}M"
            amount >= 1_000 -> "₪${String.format("%.1f", amount / 1_000)}K"
            else -> "₪${String.format("%.0f", amount)}"
        }
    }
    
    fun formatEGPShort(amount: Int): String {
        return formatEGPShort(amount.toDouble())
    }
    
    fun formatEGPShort(amount: Long): String {
        return formatEGPShort(amount.toDouble())
    }
    
    fun parseEGP(amountString: String): Double? {
        return try {
            // Remove currency symbols and spaces
            val cleanString = amountString.replace(Regex("[₪\\s,]"), "")
            cleanString.toDouble()
        } catch (e: NumberFormatException) {
            null
        }
    }
    
    fun getCurrencySymbol(): String {
        return "₪"
    }
    
    fun getCurrencyCode(): String {
        return "EGP"
    }
    
    fun getCurrencyName(): String {
        return "Egyptian Pound"
    }
}
