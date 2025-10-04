package com.clutch.app.ui.screens.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import com.clutch.app.ui.theme.ClutchColors
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * SecurityScreen.kt - Security settings and account protection
 * 
 * Complete security settings screen with authentication options,
 * privacy controls, and security monitoring.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SecurityScreen(
    onNavigateBack: () -> Unit = {}
) {
    var twoFactorEnabled by remember { mutableStateOf(false) }
    var biometricEnabled by remember { mutableStateOf(true) }
    var sessionTimeout by remember { mutableStateOf("30 minutes") }
    var loginAlerts by remember { mutableStateOf(true) }
    var deviceTrusted by remember { mutableStateOf(true) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Security") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = ClutchRed,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(ClutchLayoutSpacing.screenPadding),
            verticalArrangement = Arrangement.spacedBy(ClutchSpacing.lg)
        ) {
            item {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Security Settings",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.Black
                    )
                }
            }

            item {
                // Security Status
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.success.copy(alpha = 0.1f)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(ClutchSpacing.md),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Security,
                            contentDescription = null,
                            tint = ClutchColors.success,
                            modifier = Modifier.size(24.dp)
                        )
                        
                        Spacer(modifier = Modifier.width(ClutchSpacing.sm))
                        
                        Column {
                            Text(
                                text = "Account Security: Good",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = ClutchColors.success
                            )
                            Text(
                                text = "Your account is well protected",
                                fontSize = 14.sp,
                                color = ClutchColors.success
                            )
                        }
                    }
                }
            }

            item {
                // Authentication
                SecuritySection(
                    title = "Authentication",
                    items = listOf(
                        SecurityItem(
                            icon = Icons.Default.Fingerprint,
                            title = "Biometric Authentication",
                            description = "Use fingerprint or face recognition",
                            isToggle = true,
                            isEnabled = biometricEnabled,
                            onToggle = { biometricEnabled = !biometricEnabled }
                        ),
                        SecurityItem(
                            icon = Icons.Default.VerifiedUser,
                            title = "Two-Factor Authentication",
                            description = "Add an extra layer of security",
                            isToggle = true,
                            isEnabled = twoFactorEnabled,
                            onToggle = { twoFactorEnabled = !twoFactorEnabled }
                        ),
                        SecurityItem(
                            icon = Icons.Default.Password,
                            title = "Change Password",
                            description = "Update your account password",
                            onClick = { /* Change password */ }
                        )
                    )
                )
            }

            item {
                // Session Management
                SecuritySection(
                    title = "Session Management",
                    items = listOf(
                        SecurityItem(
                            icon = Icons.Default.Timer,
                            title = "Session Timeout",
                            description = "Automatically log out after inactivity",
                            value = sessionTimeout,
                            onClick = { /* Change timeout */ }
                        ),
                        SecurityItem(
                            icon = Icons.Default.Devices,
                            title = "Trusted Devices",
                            description = "Manage devices that can access your account",
                            onClick = { /* Manage devices */ }
                        ),
                        SecurityItem(
                            icon = Icons.Default.ExitToApp,
                            title = "Sign Out All Devices",
                            description = "Sign out from all devices",
                            onClick = { /* Sign out all */ }
                        )
                    )
                )
            }

            item {
                // Security Monitoring
                SecuritySection(
                    title = "Security Monitoring",
                    items = listOf(
                        SecurityItem(
                            icon = Icons.Default.Notifications,
                            title = "Login Alerts",
                            description = "Get notified of new login attempts",
                            isToggle = true,
                            isEnabled = loginAlerts,
                            onToggle = { loginAlerts = !loginAlerts }
                        ),
                        SecurityItem(
                            icon = Icons.Default.History,
                            title = "Login History",
                            description = "View recent login activity",
                            onClick = { /* View history */ }
                        ),
                        SecurityItem(
                            icon = Icons.Default.Security,
                            title = "Security Audit",
                            description = "Review security settings and recommendations",
                            onClick = { /* Security audit */ }
                        )
                    )
                )
            }

            item {
                // Privacy Controls
                SecuritySection(
                    title = "Privacy Controls",
                    items = listOf(
                        SecurityItem(
                            icon = Icons.Default.VisibilityOff,
                            title = "Hide Profile",
                            description = "Make your profile private",
                            isToggle = true,
                            isEnabled = !deviceTrusted,
                            onToggle = { deviceTrusted = !deviceTrusted }
                        ),
                        SecurityItem(
                            icon = Icons.Default.Block,
                            title = "Blocked Users",
                            description = "Manage blocked users and contacts",
                            onClick = { /* Manage blocked users */ }
                        )
                    )
                )
            }

            item {
                // Security Tips
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Text(
                            text = "Security Tips",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        SecurityTip(
                            icon = Icons.Default.Lock,
                            tip = "Use a strong, unique password"
                        )
                        
                        SecurityTip(
                            icon = Icons.Default.Update,
                            tip = "Keep your app updated"
                        )
                        
                        SecurityTip(
                            icon = Icons.Default.Warning,
                            tip = "Be cautious of suspicious links"
                        )
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(100.dp))
            }
        }
    }
}

@Composable
private fun SecuritySection(
    title: String,
    items: List<SecurityItem>
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(ClutchSpacing.sm)
    ) {
        Text(
            text = title,
            fontSize = 18.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color.Black,
            modifier = Modifier.padding(bottom = ClutchSpacing.sm)
        )
        
        items.forEach { item ->
            SecurityItemCard(item = item)
        }
    }
}

@Composable
private fun SecurityItemCard(
    item: SecurityItem
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { item.onClick() },
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(ClutchSpacing.md),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = null,
                tint = ClutchRed,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.width(ClutchSpacing.md))
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = item.title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.Black
                )
                Text(
                    text = item.description,
                    fontSize = 14.sp,
                    color = Color.Gray
                )
                if (item.value != null) {
                    Text(
                        text = item.value,
                        fontSize = 12.sp,
                        color = ClutchRed
                    )
                }
            }
            
            if (item.isToggle) {
                Switch(
                    checked = item.isEnabled,
                    onCheckedChange = { item.onToggle?.invoke() },
                    colors = SwitchDefaults.colors(
                        checkedThumbColor = Color.White,
                        checkedTrackColor = ClutchRed,
                        uncheckedThumbColor = Color.White,
                        uncheckedTrackColor = Color.Gray
                    )
                )
            } else {
                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = null,
                    tint = Color.Gray
                )
            }
        }
    }
}

@Composable
private fun SecurityTip(
    icon: ImageVector,
    tip: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = ClutchSpacing.xs),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = ClutchRed,
            modifier = Modifier.size(16.dp)
        )
        
        Spacer(modifier = Modifier.width(ClutchSpacing.sm))
        
        Text(
            text = tip,
            fontSize = 14.sp,
            color = Color.Black
        )
    }
}

data class SecurityItem(
    val icon: ImageVector,
    val title: String,
    val description: String,
    val value: String? = null,
    val isToggle: Boolean = false,
    val isEnabled: Boolean = false,
    val onToggle: (() -> Unit)? = null,
    val onClick: () -> Unit = {}
)
