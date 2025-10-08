package com.clutch.partners.ui.screens

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
import com.clutch.partners.ui.components.EnhancedErrorHandler
import com.clutch.partners.utils.*

data class ErrorScreenState(
    val error: Throwable? = null,
    val isRetryable: Boolean = false,
    val retryCount: Int = 0,
    val maxRetries: Int = 3,
    val currentLanguage: String = "en"
)

@Composable
fun ErrorScreen(
    error: Throwable?,
    currentLanguage: String = "en",
    onRetry: (() -> Unit)? = null,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    if (error != null) {
        EnhancedErrorHandler(
            error = error,
            currentLanguage = currentLanguage,
            onRetry = onRetry,
            onDismiss = onDismiss,
            modifier = modifier
        )
    }
}

@Composable
fun ErrorContent(
    error: Throwable?,
    currentLanguage: String = "en",
    onRetry: (() -> Unit)? = null,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    if (error != null) {
        RetryableErrorCard(
            error = error,
            currentLanguage = currentLanguage,
            onRetry = onRetry ?: {},
            onDismiss = onDismiss,
            modifier = modifier
        )
    }
}

@Composable
fun NetworkErrorScreen(
    onRetry: () -> Unit,
    onDismiss: () -> Unit,
    currentLanguage: String = "en",
    modifier: Modifier = Modifier
) {
    val errorInfo = EnhancedErrorInfo(
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
    
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = errorInfo.color.copy(alpha = 0.1f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Error Icon
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .background(
                        color = errorInfo.color.copy(alpha = 0.2f),
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
                Button(
                    onClick = onRetry,
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

@Composable
fun OfflineModeBanner(
    onRetry: () -> Unit,
    currentLanguage: String = "en",
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFFFF9800).copy(alpha = 0.1f)
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.CloudOff,
                contentDescription = null,
                tint = Color(0xFFFF9800),
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = if (currentLanguage == "ar") "وضع عدم الاتصال" else "Offline Mode",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = if (currentLanguage == "ar") 
                        "بعض الميزات قد لا تكون متاحة. سيتم المزامنة عند عودة الاتصال." 
                    else 
                        "Some features may not be available. Data will sync when connection is restored.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            }
            
            TextButton(
                onClick = onRetry,
                colors = ButtonDefaults.textButtonColors(
                    contentColor = Color(0xFFFF9800)
                )
            ) {
                Text("Retry")
            }
        }
    }
}
