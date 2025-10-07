package com.clutch.partners.ui.components

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

data class ErrorInfo(
    val title: String,
    val message: String,
    val icon: ImageVector,
    val color: Color,
    val actionText: String? = null,
    val onAction: (() -> Unit)? = null
)

@Composable
fun ErrorHandler(
    error: String?,
    currentLanguage: String,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    if (error != null) {
        val errorInfo = parseError(error, currentLanguage)
        
        AlertDialog(
            onDismissRequest = onDismiss,
            title = {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = errorInfo.icon,
                        contentDescription = null,
                        tint = errorInfo.color,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = errorInfo.title,
                        color = errorInfo.color,
                        fontWeight = FontWeight.Bold
                    )
                }
            },
            text = {
                Text(
                    text = errorInfo.message,
                    color = MaterialTheme.colorScheme.onSurface,
                    textAlign = TextAlign.Start
                )
            },
            confirmButton = {
                TextButton(
                    onClick = onDismiss,
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Text(
                        text = if (currentLanguage == "ar") "حسناً" else "OK"
                    )
                }
            },
            dismissButton = if (errorInfo.actionText != null) {
                {
                    TextButton(
                        onClick = {
                            errorInfo.onAction?.invoke()
                            onDismiss()
                        },
                        colors = ButtonDefaults.textButtonColors(
                            contentColor = errorInfo.color
                        )
                    ) {
                        Text(text = errorInfo.actionText)
                    }
                }
            } else null
        )
    }
}

fun parseError(error: String, currentLanguage: String): ErrorInfo {
    return when {
        // Network/Connection Errors
        error.contains("Failed to connect", ignoreCase = true) || 
        error.contains("Connection refused", ignoreCase = true) ||
        error.contains("Network is unreachable", ignoreCase = true) -> {
            ErrorInfo(
                title = if (currentLanguage == "ar") "خطأ في الاتصال" else "Connection Error",
                message = if (currentLanguage == "ar") 
                    "لا يمكن الاتصال بالخادم. تحقق من اتصالك بالإنترنت وحاول مرة أخرى." 
                else 
                    "Cannot connect to server. Please check your internet connection and try again.",
                icon = Icons.Default.WifiOff,
                color = Color(0xFFD32F2F)
            )
        }
        
        // Authentication Errors
        error.contains("Invalid credentials", ignoreCase = true) ||
        error.contains("Authentication failed", ignoreCase = true) -> {
            ErrorInfo(
                title = if (currentLanguage == "ar") "خطأ في المصادقة" else "Authentication Error",
                message = if (currentLanguage == "ar") 
                    "بيانات الدخول غير صحيحة. تحقق من البريد الإلكتروني وكلمة المرور." 
                else 
                    "Invalid login credentials. Please check your email and password.",
                icon = Icons.Default.Lock,
                color = Color(0xFFD32F2F)
            )
        }
        
        error.contains("Account locked", ignoreCase = true) ||
        error.contains("Too many attempts", ignoreCase = true) -> {
            ErrorInfo(
                title = if (currentLanguage == "ar") "الحساب محظور" else "Account Locked",
                message = if (currentLanguage == "ar") 
                    "تم حظر حسابك بسبب محاولات دخول متعددة فاشلة. اتصل بالدعم الفني." 
                else 
                    "Your account has been locked due to multiple failed login attempts. Please contact support.",
                icon = Icons.Default.Block,
                color = Color(0xFFD32F2F)
            )
        }
        
        // Registration Errors
        error.contains("Partner not found", ignoreCase = true) -> {
            ErrorInfo(
                title = if (currentLanguage == "ar") "الشريك غير موجود" else "Partner Not Found",
                message = if (currentLanguage == "ar") 
                    "معرف الشريك غير صحيح. تحقق من المعرف أو اتصل بفريق المبيعات." 
                else 
                    "Partner ID is incorrect. Please verify the ID or contact the sales team.",
                icon = Icons.Default.Business,
                color = Color(0xFFD32F2F)
            )
        }
        
        error.contains("Partner account already exists", ignoreCase = true) ||
        error.contains("User account with this email already exists", ignoreCase = true) -> {
            ErrorInfo(
                title = if (currentLanguage == "ar") "الحساب موجود بالفعل" else "Account Already Exists",
                message = if (currentLanguage == "ar") 
                    "يوجد حساب بالفعل بهذا البريد الإلكتروني. استخدم خيار تسجيل الدخول." 
                else 
                    "An account with this email already exists. Please use the sign in option.",
                icon = Icons.Default.Person,
                color = Color(0xFFD32F2F)
            )
        }
        
        error.contains("APPROVAL_PENDING:", ignoreCase = true) -> {
            val message = error.removePrefix("APPROVAL_PENDING: ")
            ErrorInfo(
                title = if (currentLanguage == "ar") "طلب في انتظار الموافقة" else "Approval Pending",
                message = message,
                icon = Icons.Default.Schedule,
                color = Color(0xFF1976D2)
            )
        }
        
        // Validation Errors
        error.contains("Validation", ignoreCase = true) ||
        error.contains("required", ignoreCase = true) ||
        error.contains("invalid", ignoreCase = true) -> {
            ErrorInfo(
                title = if (currentLanguage == "ar") "خطأ في البيانات" else "Validation Error",
                message = if (currentLanguage == "ar") 
                    "يرجى التحقق من صحة جميع البيانات المدخلة." 
                else 
                    "Please verify all entered information is correct.",
                icon = Icons.Default.Warning,
                color = Color(0xFFD32F2F)
            )
        }
        
        // Server Errors
        error.contains("500", ignoreCase = true) ||
        error.contains("Internal server error", ignoreCase = true) -> {
            ErrorInfo(
                title = if (currentLanguage == "ar") "خطأ في الخادم" else "Server Error",
                message = if (currentLanguage == "ar") 
                    "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً." 
                else 
                    "A server error occurred. Please try again later.",
                icon = Icons.Default.Error,
                color = Color(0xFFD32F2F)
            )
        }
        
        error.contains("404", ignoreCase = true) ||
        error.contains("Not found", ignoreCase = true) -> {
            ErrorInfo(
                title = if (currentLanguage == "ar") "غير موجود" else "Not Found",
                message = if (currentLanguage == "ar") 
                    "المورد المطلوب غير موجود." 
                else 
                    "The requested resource was not found.",
                icon = Icons.Default.SearchOff,
                color = Color(0xFFD32F2F)
            )
        }
        
        error.contains("403", ignoreCase = true) ||
        error.contains("Forbidden", ignoreCase = true) ||
        error.contains("Access denied", ignoreCase = true) -> {
            ErrorInfo(
                title = if (currentLanguage == "ar") "غير مصرح" else "Access Denied",
                message = if (currentLanguage == "ar") 
                    "ليس لديك صلاحية للوصول إلى هذا المورد." 
                else 
                    "You don't have permission to access this resource.",
                icon = Icons.Default.Lock,
                color = Color(0xFFD32F2F)
            )
        }
        
        // Timeout Errors
        error.contains("timeout", ignoreCase = true) ||
        error.contains("Request timeout", ignoreCase = true) -> {
            ErrorInfo(
                title = if (currentLanguage == "ar") "انتهت مهلة الطلب" else "Request Timeout",
                message = if (currentLanguage == "ar") 
                    "انتهت مهلة الطلب. يرجى المحاولة مرة أخرى." 
                else 
                    "Request timed out. Please try again.",
                icon = Icons.Default.Schedule,
                color = Color(0xFFD32F2F)
            )
        }
        
        // KYC/Verification Errors
        error.contains("KYC", ignoreCase = true) ||
        error.contains("verification", ignoreCase = true) -> {
            ErrorInfo(
                title = if (currentLanguage == "ar") "خطأ في التحقق" else "Verification Error",
                message = if (currentLanguage == "ar") 
                    "فشل في التحقق من الهوية. يرجى المحاولة مرة أخرى." 
                else 
                    "Identity verification failed. Please try again.",
                icon = Icons.Default.VerifiedUser,
                color = Color(0xFFD32F2F)
            )
        }
        
        // Payment/Financial Errors
        error.contains("payment", ignoreCase = true) ||
        error.contains("billing", ignoreCase = true) -> {
            ErrorInfo(
                title = if (currentLanguage == "ar") "خطأ في الدفع" else "Payment Error",
                message = if (currentLanguage == "ar") 
                    "حدث خطأ في معالجة الدفع. تحقق من معلومات الدفع." 
                else 
                    "Payment processing error. Please check your payment information.",
                icon = Icons.Default.Payment,
                color = Color(0xFFD32F2F)
            )
        }
        
        // Generic Error
        else -> {
            ErrorInfo(
                title = if (currentLanguage == "ar") "خطأ" else "Error",
                message = if (currentLanguage == "ar") 
                    "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى." 
                else 
                    "An unexpected error occurred. Please try again.",
                icon = Icons.Default.Error,
                color = Color(0xFFD32F2F)
            )
        }
    }
}