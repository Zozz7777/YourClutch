package com.clutch.partners.services

import android.content.Context
import com.clutch.partners.data.api.PartnersApiService
import com.clutch.partners.data.model.SMSNotification
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SMSService @Inject constructor(
    @ApplicationContext private val context: Context,
    private val apiService: PartnersApiService
) {
    
    fun sendOrderSMS(
        phoneNumber: String,
        orderId: String,
        isRTL: Boolean = false
    ) {
        val message = if (isRTL) {
            "طلب جديد #$orderId - يرجى مراجعة التطبيق"
        } else {
            "New order #$orderId - Please check the app"
        }
        
        sendSMS(phoneNumber, message, "order_notification")
    }
    
    fun sendPaymentSMS(
        phoneNumber: String,
        amount: String,
        paymentId: String,
        isRTL: Boolean = false
    ) {
        val message = if (isRTL) {
            "دفعة مستلمة: $amount - رقم الدفعة: $paymentId"
        } else {
            "Payment received: $amount - Payment ID: $paymentId"
        }
        
        sendSMS(phoneNumber, message, "payment_notification")
    }
    
    fun sendKYCStatusSMS(
        phoneNumber: String,
        status: String,
        isRTL: Boolean = false
    ) {
        val message = if (isRTL) {
            when (status.lowercase()) {
                "approved" -> "تم الموافقة على التحقق من الهوية - كلتش"
                "rejected" -> "لم يتم الموافقة على التحقق من الهوية - يرجى المحاولة مرة أخرى"
                else -> "حالة التحقق من الهوية: $status - كلتش"
            }
        } else {
            when (status.lowercase()) {
                "approved" -> "Identity verification approved - Clutch"
                "rejected" -> "Identity verification rejected - Please try again"
                else -> "KYC status: $status - Clutch"
            }
        }
        
        sendSMS(phoneNumber, message, "kyc_notification")
    }
    
    fun sendSystemSMS(
        phoneNumber: String,
        message: String,
        isRTL: Boolean = false
    ) {
        val smsMessage = if (isRTL) {
            "إشعار نظام: $message - كلتش"
        } else {
            "System notification: $message - Clutch"
        }
        
        sendSMS(phoneNumber, smsMessage, "system_notification")
    }
    
    fun sendOTP(
        phoneNumber: String,
        otp: String,
        isRTL: Boolean = false
    ) {
        val message = if (isRTL) {
            "رمز التحقق: $otp - كلتش"
        } else {
            "Verification code: $otp - Clutch"
        }
        
        sendSMS(phoneNumber, message, "otp")
    }
    
    private fun sendSMS(
        phoneNumber: String,
        message: String,
        type: String
    ) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val smsNotification = SMSNotification(
                    to = phoneNumber,
                    message = message,
                    type = type
                )
                
                // apiService.sendSmsNotification(
                //     token = "Bearer ${getAuthToken()}", // You'll need to implement this
                //     request = smsNotification
                // )
            } catch (e: Exception) {
                // Handle error - maybe queue for later retry
                e.printStackTrace()
            }
        }
    }
    
    private suspend fun getAuthToken(): String {
        // Implement token retrieval from secure storage
        return ""
    }
}
