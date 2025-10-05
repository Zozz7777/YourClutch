package com.clutch.partners.ui.screens.main

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.clutch.partners.ClutchPartnersTheme
import com.clutch.partners.navigation.Screen
import com.clutch.partners.viewmodel.AuthViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    navController: NavController,
    authViewModel: AuthViewModel = hiltViewModel()
) {
    val uiState by authViewModel.uiState.collectAsState()
    
    ClutchPartnersTheme {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Top App Bar
            TopAppBar(
                title = { Text("Settings") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
            
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Profile Section
                item {
                    SettingsSection("Profile") {
                        SettingItem(
                            title = "Business Information",
                            subtitle = uiState.user?.businessName ?: "Not set",
                            icon = Icons.Default.Business,
                            onClick = { /* Navigate to business info */ }
                        )
                        SettingItem(
                            title = "Account Settings",
                            subtitle = "Manage your account",
                            icon = Icons.Default.AccountCircle,
                            onClick = { /* Navigate to account settings */ }
                        )
                    }
                }
                
                // Preferences Section
                item {
                    SettingsSection("Preferences") {
                        SettingItem(
                            title = "Language",
                            subtitle = "English",
                            icon = Icons.Default.Language,
                            onClick = { /* Navigate to language settings */ }
                        )
                        SettingItem(
                            title = "Theme",
                            subtitle = "System",
                            icon = Icons.Default.Palette,
                            onClick = { /* Navigate to theme settings */ }
                        )
                        SettingItem(
                            title = "Notifications",
                            subtitle = "Manage notification preferences",
                            icon = Icons.Default.Notifications,
                            onClick = { /* Navigate to notification settings */ }
                        )
                    }
                }
                
                // Business Section
                item {
                    SettingsSection("Business") {
                        SettingItem(
                            title = "Staff Management",
                            subtitle = "Manage your team",
                            icon = Icons.Default.Group,
                            onClick = { navController.navigate(Screen.Staff.route) }
                        )
                        SettingItem(
                            title = "Locations",
                            subtitle = "Manage business locations",
                            icon = Icons.Default.LocationOn,
                            onClick = { /* Navigate to locations */ }
                        )
                        SettingItem(
                            title = "Contracts",
                            subtitle = "View and manage contracts",
                            icon = Icons.Default.Description,
                            onClick = { navController.navigate(Screen.Contracts.route) }
                        )
                    }
                }
                
                // Support Section
                item {
                    SettingsSection("Support") {
                        SettingItem(
                            title = "Help & Support",
                            subtitle = "Get help and support",
                            icon = Icons.Default.Help,
                            onClick = { navController.navigate(Screen.Support.route) }
                        )
                        SettingItem(
                            title = "About",
                            subtitle = "App version and information",
                            icon = Icons.Default.Info,
                            onClick = { /* Navigate to about */ }
                        )
                    }
                }
                
                // Logout
                item {
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { 
                            authViewModel.logout()
                            navController.navigate(Screen.Splash.route) {
                                popUpTo(0) { inclusive = true }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.error
                        )
                    ) {
                        Icon(Icons.Default.Logout, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Logout")
                    }
                }
            }
        }
    }
}

@Composable
fun SettingsSection(
    title: String,
    content: @Composable () -> Unit
) {
    Column {
        Text(
            text = title,
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground,
            modifier = Modifier.padding(vertical = 8.dp)
        )
        content()
        Spacer(modifier = Modifier.height(16.dp))
    }
}

@Composable
fun SettingItem(
    title: String,
    subtitle: String,
    icon: ImageVector,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
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
                imageVector = icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
                )
            }
            
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.5f)
            )
        }
    }
}
