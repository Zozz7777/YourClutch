package com.clutch.partners.services

import android.content.Context
import com.clutch.partners.data.api.PartnersApiService
import com.clutch.partners.data.model.EmailNotification
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class EmailService @Inject constructor(
    @ApplicationContext private val context: Context,
    private val apiService: PartnersApiService
) {
    
    fun sendOrderNotification(
        recipientEmail: String,
        orderId: String,
        orderDetails: String,
        isRTL: Boolean = false
    ) {
        val subject = if (isRTL) "إشعار طلب جديد - $orderId" else "New Order Notification - $orderId"
        val body = if (isRTL) {
            """
            مرحباً،
            
            تم استلام طلب جديد برقم: $orderId
            
            تفاصيل الطلب:
            $orderDetails
            
            يرجى مراجعة الطلب في التطبيق.
            
            شكراً لك
            فريق كلتش
            """.trimIndent()
        } else {
            """
            Hello,
            
            A new order has been received with ID: $orderId
            
            Order Details:
            $orderDetails
            
            Please review the order in the app.
            
            Thank you
            Clutch Team
            """.trimIndent()
        }
        
        sendEmail(recipientEmail, subject, body, "order_notification")
    }
    
    fun sendPaymentNotification(
        recipientEmail: String,
        amount: String,
        paymentId: String,
        isRTL: Boolean = false
    ) {
        val subject = if (isRTL) "إشعار دفع - $paymentId" else "Payment Notification - $paymentId"
        val body = if (isRTL) {
            """
            مرحباً،
            
            تم استلام دفعة بقيمة: $amount
            
            رقم الدفعة: $paymentId
            
            يرجى مراجعة التفاصيل في التطبيق.
            
            شكراً لك
            فريق كلتش
            """.trimIndent()
        } else {
            """
            Hello,
            
            A payment of $amount has been received.
            
            Payment ID: $paymentId
            
            Please review the details in the app.
            
            Thank you
            Clutch Team
            """.trimIndent()
        }
        
        sendEmail(recipientEmail, subject, body, "payment_notification")
    }
    
    fun sendKYCStatusNotification(
        recipientEmail: String,
        status: String,
        isRTL: Boolean = false
    ) {
        val subject = if (isRTL) "حالة التحقق من الهوية" else "KYC Verification Status"
        val body = if (isRTL) {
            when (status.lowercase()) {
                "approved" -> {
                    """
                    مرحباً،
                    
                    تم الموافقة على التحقق من هويتك.
                    
                    يمكنك الآن استخدام جميع ميزات التطبيق.
                    
                    شكراً لك
                    فريق كلتش
                    """.trimIndent()
                }
                "rejected" -> {
                    """
                    مرحباً،
                    
                    للأسف، لم يتم الموافقة على التحقق من هويتك.
                    
                    يرجى مراجعة المستندات المرفوعة وإعادة المحاولة.
                    
                    شكراً لك
                    فريق كلتش
                    """.trimIndent()
                }
                else -> {
                    """
                    مرحباً،
                    
                    حالة التحقق من هويتك: $status
                    
                    يرجى مراجعة التطبيق للحصول على المزيد من التفاصيل.
                    
                    شكراً لك
                    فريق كلتش
                    """.trimIndent()
                }
            }
        } else {
            when (status.lowercase()) {
                "approved" -> {
                    """
                    Hello,
                    
                    Your identity verification has been approved.
                    
                    You can now use all app features.
                    
                    Thank you
                    Clutch Team
                    """.trimIndent()
                }
                "rejected" -> {
                    """
                    Hello,
                    
                    Unfortunately, your identity verification was not approved.
                    
                    Please review the uploaded documents and try again.
                    
                    Thank you
                    Clutch Team
                    """.trimIndent()
                }
                else -> {
                    """
                    Hello,
                    
                    Your KYC verification status: $status
                    
                    Please check the app for more details.
                    
                    Thank you
                    Clutch Team
                    """.trimIndent()
                }
            }
        }
        
        sendEmail(recipientEmail, subject, body, "kyc_notification")
    }
    
    fun sendSystemNotification(
        recipientEmail: String,
        title: String,
        message: String,
        isRTL: Boolean = false
    ) {
        val subject = if (isRTL) "إشعار نظام - $title" else "System Notification - $title"
        val body = if (isRTL) {
            """
            مرحباً،
            
            $title
            
            $message
            
            شكراً لك
            فريق كلتش
            """.trimIndent()
        } else {
            """
            Hello,
            
            $title
            
            $message
            
            Thank you
            Clutch Team
            """.trimIndent()
        }
        
        sendEmail(recipientEmail, subject, body, "system_notification")
    }
    
    private fun sendEmail(
        recipientEmail: String,
        subject: String,
        body: String,
        type: String
    ) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val emailNotification = EmailNotification(
                    to = recipientEmail,
                    subject = subject,
                    body = body,
                    type = type,
                    isHtml = false
                )
                
                // apiService.sendEmailNotification(
                //     token = "Bearer ${getAuthToken()}", // You'll need to implement this
                //     request = emailNotification
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
