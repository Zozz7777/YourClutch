package com.clutch.app.ui.screens.account

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.hilt.navigation.compose.hiltViewModel
import com.clutch.app.R
import com.clutch.app.ui.theme.*
import com.clutch.app.utils.TranslationManager
import com.clutch.app.ui.screens.DashboardViewModel
import com.clutch.app.data.model.User
import com.clutch.app.data.model.UserPreferences
import com.clutch.app.data.model.NotificationPreferences

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AccountSettingsScreen(
    onNavigateBack: () -> Unit = {},
    onSaveProfile: () -> Unit = {},
    onNavigateToChangeAvatar: () -> Unit = {},
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val currentLanguage = TranslationManager.getCurrentLanguage()
    val layoutDirection = if (currentLanguage == "ar") LayoutDirection.Rtl else LayoutDirection.Ltr
    
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    // Mock user data for now - in real app, this would come from user profile
    val user = User(
        id = "1",
        email = "user@example.com",
        firstName = "John",
        lastName = "Doe",
        phone = "+1234567890",
        dateOfBirth = "1990-01-01",
        gender = "Male",
        profileImage = null,
        isEmailVerified = true,
        isPhoneVerified = true,
        preferences = UserPreferences(
            language = "en",
            theme = "light",
            notifications = NotificationPreferences(
                push = true,
                email = true,
                sms = false
            ),
            receiveOffers = true,
            subscribeNewsletter = true
        ),
        createdAt = "2024-01-01",
        updatedAt = "2024-01-01"
    )
    
    // Form state
    var firstName by remember { mutableStateOf(user?.firstName ?: "") }
    var lastName by remember { mutableStateOf(user?.lastName ?: "") }
    var email by remember { mutableStateOf(user?.email ?: "") }
    var phoneNumber by remember { mutableStateOf(user?.phone ?: "") }
    var dateOfBirth by remember { mutableStateOf(user?.dateOfBirth ?: "") }
    var isEditing by remember { mutableStateOf(false) }

    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(ClutchColors.background),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = ClutchRed
                        )
                    }
                    Text(
                        text = "Account Settings",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = ClutchColors.foreground
                    )
                    TextButton(
                        onClick = {
                            if (isEditing) {
                                // Save changes
                                onSaveProfile()
                                isEditing = false
                            } else {
                                isEditing = true
                            }
                        }
                    ) {
                        Text(
                            text = if (isEditing) "Save" else "Edit",
                            color = ClutchRed,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
            
            item {
                // Profile Picture Section
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Profile Picture
                        Box(
                            modifier = Modifier
                                .size(100.dp)
                                .clip(CircleShape)
                                .background(ClutchRed.copy(alpha = 0.1f))
                                .clickable { onNavigateToChangeAvatar() },
                            contentAlignment = Alignment.Center
                        ) {
                            if (user?.profileImage != null) {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = "Profile Picture",
                                    tint = ClutchRed,
                                    modifier = Modifier.size(50.dp)
                                )
                            } else {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = "Profile",
                                    tint = ClutchRed,
                                    modifier = Modifier.size(50.dp)
                                )
                            }
                        }
                        
                        Spacer(modifier = Modifier.height(12.dp))
                        
                        Text(
                            text = "Change Profile Picture",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = ClutchRed
                        )
                        
                        Text(
                            text = "Tap to change your profile picture",
                            fontSize = 14.sp,
                            color = ClutchColors.mutedForeground,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }
            
            item {
                // Personal Information Section
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp)
                    ) {
                        Text(
                            text = "Personal Information",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = ClutchColors.foreground
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // First Name
                        OutlinedTextField(
                            value = firstName,
                            onValueChange = { if (isEditing) firstName = it },
                            label = { Text("First Name") },
                            enabled = isEditing,
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = ClutchRed,
                                unfocusedBorderColor = ClutchColors.mutedForeground,
                                focusedLabelColor = ClutchRed,
                                unfocusedLabelColor = ClutchColors.mutedForeground,
                                focusedTextColor = ClutchColors.foreground,
                                unfocusedTextColor = ClutchColors.foreground,
                                disabledTextColor = ClutchColors.foreground,
                                disabledLabelColor = ClutchColors.mutedForeground,
                                disabledBorderColor = ClutchColors.mutedForeground
                            ),
                            shape = RoundedCornerShape(8.dp)
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Last Name
                        OutlinedTextField(
                            value = lastName,
                            onValueChange = { if (isEditing) lastName = it },
                            label = { Text("Last Name") },
                            enabled = isEditing,
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = ClutchRed,
                                unfocusedBorderColor = ClutchColors.mutedForeground,
                                focusedLabelColor = ClutchRed,
                                unfocusedLabelColor = ClutchColors.mutedForeground,
                                focusedTextColor = ClutchColors.foreground,
                                unfocusedTextColor = ClutchColors.foreground,
                                disabledTextColor = ClutchColors.foreground,
                                disabledLabelColor = ClutchColors.mutedForeground,
                                disabledBorderColor = ClutchColors.mutedForeground
                            ),
                            shape = RoundedCornerShape(8.dp)
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Email
                        OutlinedTextField(
                            value = email,
                            onValueChange = { if (isEditing) email = it },
                            label = { Text("Email") },
                            enabled = isEditing,
                            modifier = Modifier.fillMaxWidth(),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = ClutchRed,
                                unfocusedBorderColor = ClutchColors.mutedForeground,
                                focusedLabelColor = ClutchRed,
                                unfocusedLabelColor = ClutchColors.mutedForeground,
                                focusedTextColor = ClutchColors.foreground,
                                unfocusedTextColor = ClutchColors.foreground,
                                disabledTextColor = ClutchColors.foreground,
                                disabledLabelColor = ClutchColors.mutedForeground,
                                disabledBorderColor = ClutchColors.mutedForeground
                            ),
                            shape = RoundedCornerShape(8.dp)
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Phone Number
                        OutlinedTextField(
                            value = phoneNumber,
                            onValueChange = { if (isEditing) phoneNumber = it },
                            label = { Text("Phone Number") },
                            enabled = isEditing,
                            modifier = Modifier.fillMaxWidth(),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = ClutchRed,
                                unfocusedBorderColor = ClutchColors.mutedForeground,
                                focusedLabelColor = ClutchRed,
                                unfocusedLabelColor = ClutchColors.mutedForeground,
                                focusedTextColor = ClutchColors.foreground,
                                unfocusedTextColor = ClutchColors.foreground,
                                disabledTextColor = ClutchColors.foreground,
                                disabledLabelColor = ClutchColors.mutedForeground,
                                disabledBorderColor = ClutchColors.mutedForeground
                            ),
                            shape = RoundedCornerShape(8.dp)
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Date of Birth
                        OutlinedTextField(
                            value = dateOfBirth,
                            onValueChange = { if (isEditing) dateOfBirth = it },
                            label = { Text("Date of Birth") },
                            enabled = isEditing,
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = ClutchRed,
                                unfocusedBorderColor = ClutchColors.mutedForeground,
                                focusedLabelColor = ClutchRed,
                                unfocusedLabelColor = ClutchColors.mutedForeground,
                                focusedTextColor = ClutchColors.foreground,
                                unfocusedTextColor = ClutchColors.foreground,
                                disabledTextColor = ClutchColors.foreground,
                                disabledLabelColor = ClutchColors.mutedForeground,
                                disabledBorderColor = ClutchColors.mutedForeground
                            ),
                            shape = RoundedCornerShape(8.dp)
                        )
                    }
                }
            }
            
            item {
                // Security Section
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp)
                    ) {
                        Text(
                            text = "Security",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = ClutchColors.foreground
                        )
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Change Password
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { /* Navigate to change password */ },
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = "Change Password",
                                tint = ClutchColors.foreground,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(16.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Change Password",
                                    fontSize = 16.sp,
                                    color = ClutchColors.foreground
                                )
                                Text(
                                    text = "Update your account password",
                                    fontSize = 14.sp,
                                    color = Color.Gray
                                )
                            }
                            Icon(
                                imageVector = Icons.Default.ChevronRight,
                                contentDescription = "Navigate",
                                tint = ClutchColors.mutedForeground,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Divider(color = Color.LightGray, thickness = 1.dp)
                        
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        // Two-Factor Authentication
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { /* Navigate to 2FA settings */ },
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Security,
                                contentDescription = "Two-Factor Authentication",
                                tint = ClutchColors.foreground,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(16.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Two-Factor Authentication",
                                    fontSize = 16.sp,
                                    color = ClutchColors.foreground
                                )
                                Text(
                                    text = "Add an extra layer of security",
                                    fontSize = 14.sp,
                                    color = Color.Gray
                                )
                            }
                            Switch(
                                checked = false, // TODO: Get from user preferences
                                onCheckedChange = { /* Toggle 2FA */ },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = ClutchColors.card,
                                    checkedTrackColor = ClutchRed,
                                    uncheckedThumbColor = ClutchColors.card,
                                    uncheckedTrackColor = ClutchColors.mutedForeground
                                )
                            )
                        }
                    }
                }
            }
            
            item {
                Spacer(modifier = Modifier.height(100.dp)) // Space for bottom navigation
            }
        }
    }
}
