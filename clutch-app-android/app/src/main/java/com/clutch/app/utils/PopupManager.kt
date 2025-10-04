package com.clutch.app.utils

import android.content.Context
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.clutch.app.ui.theme.ClutchColors
import com.clutch.app.ui.theme.ClutchRed
import kotlinx.coroutines.delay

object PopupManager {
    private var currentPopup: PopupData? = null
    private var isShowing = false
    
    data class PopupData(
        val id: String,
        val title: String,
        val message: String,
        val imageUrl: String? = null,
        val actionText: String? = null,
        val actionUrl: String? = null,
        val dismissible: Boolean = true,
        val autoDismissSeconds: Int? = null,
        val priority: Int = 1 // 1 = high, 2 = medium, 3 = low
    )
    
    fun showPopup(popup: PopupData) {
        if (!isShowing || popup.priority < (currentPopup?.priority ?: 0)) {
            currentPopup = popup
            isShowing = true
        }
    }
    
    fun dismissPopup() {
        currentPopup = null
        isShowing = false
    }
    
    fun getCurrentPopup(): PopupData? = currentPopup
    fun isPopupShowing(): Boolean = isShowing
}

@Composable
fun PopupOverlay() {
    val popup = PopupManager.getCurrentPopup()
    val context = LocalContext.current
    
    if (popup != null) {
        Dialog(
            onDismissRequest = { PopupManager.dismissPopup() },
            properties = DialogProperties(
                dismissOnBackPress = popup.dismissible,
                dismissOnClickOutside = popup.dismissible
            )
        ) {
            PopupCard(
                popup = popup,
                onDismiss = { PopupManager.dismissPopup() },
                onAction = { actionUrl ->
                    // Handle action URL (open browser, navigate to screen, etc.)
                    PopupManager.dismissPopup()
                }
            )
        }
        
        // Auto dismiss if specified
        if (popup.autoDismissSeconds != null) {
            LaunchedEffect(popup.id) {
                delay(popup.autoDismissSeconds * 1000L)
                PopupManager.dismissPopup()
            }
        }
    }
}

@Composable
private fun PopupCard(
    popup: PopupManager.PopupData,
    onDismiss: () -> Unit,
    onAction: (String?) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp),
        colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Close button
            if (popup.dismissible) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = ClutchColors.mutedForeground
                        )
                    }
                }
            }
            
            // Title
            Text(
                text = popup.title,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = ClutchColors.foreground,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Message
            Text(
                text = popup.message,
                fontSize = 16.sp,
                color = ClutchColors.mutedForeground,
                textAlign = TextAlign.Center,
                lineHeight = 22.sp
            )
            
            Spacer(modifier = Modifier.height(20.dp))
            
            // Action button
            if (popup.actionText != null) {
                Button(
                    onClick = { onAction(popup.actionUrl) },
                    colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = popup.actionText,
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
