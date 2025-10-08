package com.clutch.partners.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.clutch.partners.utils.*

data class EnhancedErrorInfo(
    val title: String,
    val message: String,
    val icon: ImageVector,
    val color: Color,
    val isRetryable: Boolean = false,
    val retryText: String? = null,
    val onRetry: (() -> Unit)? = null,
    val onDismiss: (() -> Unit)? = null
)

@Composable
fun EnhancedErrorHandler(
    error: Throwable?,
    currentLanguage: String = "en",
    onRetry: (() -> Unit)? = null,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    if (error != null) {
        val errorInfo = parseEnhancedError(error, currentLanguage)
        
        AlertDialog(
            onDismissRequest = onDismiss,
            modifier = modifier,
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Error Icon
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .background(
                            color = errorInfo.color.copy(alpha = 0.1f),
                            shape = RoundedCornerShape(32.dp)
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = errorInfo.icon,
                        contentDescription = null,
                        tint = errorInfo.color,
                        modifier = Modifier.size(32.dp)
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Error Title
                Text(
                    text = errorInfo.title,
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface,
                    textAlign = TextAlign.Center
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                // Error Message
                Text(
                    text = errorInfo.message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                    textAlign = TextAlign.Center
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // Action Buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    if (errorInfo.isRetryable && errorInfo.onRetry != null) {
                        Button(
                            onClick = {
                                errorInfo.onRetry?.invoke()
                                onDismiss()
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = errorInfo.color
                            )
                        ) {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = null,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(errorInfo.retryText ?: "Retry")
                        }
                    }
                    
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Dismiss")
                    }
                }
            }
        }
    }
}

@Composable
fun RetryableErrorCard(
    error: Throwable?,
    currentLanguage: String = "en",
    onRetry: () -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    if (error != null) {
        val errorInfo = parseEnhancedError(error, currentLanguage)
        
        Card(
            modifier = modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = errorInfo.color.copy(alpha = 0.1f)
            ),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = errorInfo.icon,
                    contentDescription = null,
                    tint = errorInfo.color,
                    modifier = Modifier.size(24.dp)
                )
                
                Spacer(modifier = Modifier.width(12.dp))
                
                Column(
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = errorInfo.title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Medium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = errorInfo.message,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                    )
                }
                
                if (errorInfo.isRetryable) {
                    IconButton(
                        onClick = onRetry,
                        modifier = Modifier.size(40.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Retry",
                            tint = errorInfo.color
                        )
                    }
                }
                
                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier.size(40.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Dismiss",
                        tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                    )
                }
            }
        }
    }
}

fun parseEnhancedError(error: Throwable, currentLanguage: String): EnhancedErrorInfo {
    return when (error) {
        is NoNetworkException -> {
            EnhancedErrorInfo(
                title = if (currentLanguage == "ar") "لا يوجد اتصال بالإنترنت" else "No Internet Connection",
                message = if (currentLanguage == "ar") 
                    "يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى." 
                else 
                    "Please check your internet connection and try again.",
                icon = Icons.Default.WifiOff,
                color = Color(0xFFD32F2F),
                isRetryable = true,
                retryText = if (currentLanguage == "ar") "إعادة المحاولة" else "Retry"
            )
        }
        
        is ConnectException -> {
            EnhancedErrorInfo(
                title = if (currentLanguage == "ar") "خطأ في الاتصال" else "Connection Error",
                message = if (currentLanguage == "ar") 
                    "لا يمكن الاتصال بالخادم. تحقق من اتصالك بالإنترنت وحاول مرة أخرى." 
                else 
                    "Cannot connect to server. Please check your internet connection and try again.",
                icon = Icons.Default.WifiOff,
                color = Color(0xFFD32F2F),
                isRetryable = true,
                retryText = if (currentLanguage == "ar") "إعادة المحاولة" else "Retry"
            )
        }
        
        is SocketTimeoutException -> {
            EnhancedErrorInfo(
                title = if (currentLanguage == "ar") "انتهت مهلة الاتصال" else "Connection Timeout",
                message = if (currentLanguage == "ar") 
                    "استغرق الاتصال وقتاً أطول من المتوقع. يرجى المحاولة مرة أخرى." 
                else 
                    "Connection took longer than expected. Please try again.",
                icon = Icons.Default.Schedule,
                color = Color(0xFFFF9800),
                isRetryable = true,
                retryText = if (currentLanguage == "ar") "إعادة المحاولة" else "Retry"
            )
        }
        
        is UnknownHostException -> {
            EnhancedErrorInfo(
                title = if (currentLanguage == "ar") "لا يمكن العثور على الخادم" else "Server Not Found",
                message = if (currentLanguage == "ar") 
                    "لا يمكن العثور على الخادم. تحقق من اتصالك بالإنترنت." 
                else 
                    "Cannot find server. Please check your internet connection.",
                icon = Icons.Default.SearchOff,
                color = Color(0xFFD32F2F),
                isRetryable = true,
                retryText = if (currentLanguage == "ar") "إعادة المحاولة" else "Retry"
            )
        }
        
        is AuthenticationException -> {
            EnhancedErrorInfo(
                title = if (currentLanguage == "ar") "خطأ في المصادقة" else "Authentication Error",
                message = if (currentLanguage == "ar") 
                    "فشل في تسجيل الدخول. يرجى التحقق من بيانات الاعتماد." 
                else 
                    "Login failed. Please check your credentials.",
                icon = Icons.Default.Lock,
                color = Color(0xFFD32F2F),
                isRetryable = false
            )
        }
        
        is AuthorizationException -> {
            EnhancedErrorInfo(
                title = if (currentLanguage == "ar") "غير مصرح" else "Access Denied",
                message = if (currentLanguage == "ar") 
                    "ليس لديك صلاحية للوصول إلى هذا المورد." 
                else 
                    "You don't have permission to access this resource.",
                icon = Icons.Default.Block,
                color = Color(0xFFD32F2F),
                isRetryable = false
            )
        }
        
        is ValidationException -> {
            EnhancedErrorInfo(
                title = if (currentLanguage == "ar") "خطأ في البيانات" else "Validation Error",
                message = if (currentLanguage == "ar") 
                    "يرجى التحقق من صحة جميع البيانات المدخلة." 
                else 
                    "Please verify all entered information is correct.",
                icon = Icons.Default.Warning,
                color = Color(0xFFFF9800),
                isRetryable = false
            )
        }
        
        is ServerException -> {
            EnhancedErrorInfo(
                title = if (currentLanguage == "ar") "خطأ في الخادم" else "Server Error",
                message = if (currentLanguage == "ar") 
                    "حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً." 
                else 
                    "A server error occurred. Please try again later.",
                icon = Icons.Default.Error,
                color = Color(0xFFD32F2F),
                isRetryable = true,
                retryText = if (currentLanguage == "ar") "إعادة المحاولة" else "Retry"
            )
        }
        
        is IOException -> {
            EnhancedErrorInfo(
                title = if (currentLanguage == "ar") "خطأ في الشبكة" else "Network Error",
                message = if (currentLanguage == "ar") 
                    "حدث خطأ في الشبكة. يرجى المحاولة مرة أخرى." 
                else 
                    "A network error occurred. Please try again.",
                icon = Icons.Default.WifiOff,
                color = Color(0xFFD32F2F),
                isRetryable = true,
                retryText = if (currentLanguage == "ar") "إعادة المحاولة" else "Retry"
            )
        }
        
        else -> {
            EnhancedErrorInfo(
                title = if (currentLanguage == "ar") "خطأ غير متوقع" else "Unexpected Error",
                message = if (currentLanguage == "ar") 
                    "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى." 
                else 
                    "An unexpected error occurred. Please try again.",
                icon = Icons.Default.Error,
                color = Color(0xFFD32F2F),
                isRetryable = true,
                retryText = if (currentLanguage == "ar") "إعادة المحاولة" else "Retry"
            )
        }
    }
}
