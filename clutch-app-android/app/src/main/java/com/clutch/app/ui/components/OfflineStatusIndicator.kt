package com.clutch.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.hilt.navigation.compose.hiltViewModel
import com.clutch.app.features.offline.EnhancedOfflineManager
import com.clutch.app.features.offline.SyncState
import com.clutch.app.ui.theme.ClutchRed

@Composable
fun OfflineStatusIndicator(
    modifier: Modifier = Modifier,
    viewModel: EnhancedOfflineManager = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    when {
        !uiState.isOnline -> {
            OfflineBanner(
                modifier = modifier,
                message = "You're offline. Changes will sync when you're back online.",
                onRetry = { viewModel.forceSync() }
            )
        }
        uiState.syncState is SyncState.Syncing -> {
            SyncingBanner(
                modifier = modifier,
                message = "Syncing your changes...",
                pendingCount = uiState.pendingActions.size
            )
        }
        uiState.syncState is SyncState.Failed -> {
            ErrorBanner(
                modifier = modifier,
                message = uiState.errorMessage,
                onRetry = { viewModel.forceSync() },
                onDismiss = { viewModel.clearError() }
            )
        }
        uiState.pendingActions.isNotEmpty() -> {
            PendingBanner(
                modifier = modifier,
                message = "${uiState.pendingActions.size} actions pending sync",
                onSync = { viewModel.forceSync() }
            )
        }
    }
}

@Composable
private fun OfflineBanner(
    modifier: Modifier = Modifier,
    message: String,
    onRetry: () -> Unit
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFFF6B6B)),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.WifiOff,
                contentDescription = "Offline",
                tint = Color.White,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = message,
                color = Color.White,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.weight(1f)
            )
            TextButton(
                onClick = onRetry,
                colors = ButtonDefaults.textButtonColors(contentColor = Color.White)
            ) {
                Text("Retry", fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun SyncingBanner(
    modifier: Modifier = Modifier,
    message: String,
    pendingCount: Int
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF4CAF50)),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            CircularProgressIndicator(
                modifier = Modifier.size(16.dp),
                color = Color.White,
                strokeWidth = 2.dp
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = message,
                color = Color.White,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.weight(1f)
            )
            if (pendingCount > 0) {
                Text(
                    text = "$pendingCount",
                    color = Color.White,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
private fun ErrorBanner(
    modifier: Modifier = Modifier,
    message: String,
    onRetry: () -> Unit,
    onDismiss: () -> Unit
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = ClutchRed),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Error,
                contentDescription = "Error",
                tint = Color.White,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = message,
                color = Color.White,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.weight(1f)
            )
            TextButton(
                onClick = onRetry,
                colors = ButtonDefaults.textButtonColors(contentColor = Color.White)
            ) {
                Text("Retry", fontSize = 12.sp)
            }
            TextButton(
                onClick = onDismiss,
                colors = ButtonDefaults.textButtonColors(contentColor = Color.White)
            ) {
                Text("Dismiss", fontSize = 12.sp)
            }
        }
    }
}

@Composable
private fun PendingBanner(
    modifier: Modifier = Modifier,
    message: String,
    onSync: () -> Unit
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFFF9800)),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Sync,
                contentDescription = "Pending",
                tint = Color.White,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = message,
                color = Color.White,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                modifier = Modifier.weight(1f)
            )
            TextButton(
                onClick = onSync,
                colors = ButtonDefaults.textButtonColors(contentColor = Color.White)
            ) {
                Text("Sync Now", fontSize = 12.sp)
            }
        }
    }
}
