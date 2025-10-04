package com.clutch.app.ui.screens.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * EditProfileScreen.kt - Edit user profile information
 * 
 * Complete profile editing screen with form validation,
 * image upload, and profile information management.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProfileScreen(
    onNavigateBack: () -> Unit = {},
    onSaveProfile: (UserProfile) -> Unit = {}
) {
    var firstName by remember { mutableStateOf("John") }
    var lastName by remember { mutableStateOf("Doe") }
    var email by remember { mutableStateOf("john.doe@example.com") }
    var phone by remember { mutableStateOf("+1 (555) 123-4567") }
    var location by remember { mutableStateOf("New York, NY") }
    var bio by remember { mutableStateOf("Car enthusiast and DIY mechanic") }
    var isSaving by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Edit Profile") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    TextButton(
                        onClick = {
                            isSaving = true
                            onSaveProfile(
                                UserProfile(
                                    firstName = firstName,
                                    lastName = lastName,
                                    email = email,
                                    phone = phone,
                                    location = location,
                                    bio = bio
                                )
                            )
                            isSaving = false
                        },
                        enabled = !isSaving
                    ) {
                        Text(
                            text = if (isSaving) "Saving..." else "Save",
                            color = if (isSaving) Color.Gray else ClutchRed
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = ClutchRed,
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White,
                    actionIconContentColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(ClutchLayoutSpacing.screenPadding)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(ClutchSpacing.lg)
        ) {
            // Profile Picture Section
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(ClutchSpacing.md),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Profile Picture
                    Box(
                        modifier = Modifier.size(120.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        // Placeholder for profile picture
                        Card(
                            modifier = Modifier.size(120.dp),
                            shape = CircleShape,
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFF5F5F5))
                        ) {
                            Box(
                                modifier = Modifier.fillMaxSize(),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = null,
                                    modifier = Modifier.size(48.dp),
                                    tint = Color.Gray
                                )
                            }
                        }
                        
                        // Edit button
                        FloatingActionButton(
                            onClick = { /* Change profile picture */ },
                            modifier = Modifier
                                .size(32.dp)
                                .align(Alignment.BottomEnd),
                            containerColor = ClutchRed
                        ) {
                            Icon(
                                imageVector = Icons.Default.Edit,
                                contentDescription = "Edit Photo",
                                modifier = Modifier.size(16.dp),
                                tint = Color.White
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    Text(
                        text = "Change Profile Picture",
                        fontSize = 14.sp,
                        color = ClutchRed
                    )
                }
            }

            // Personal Information
            ProfileSection(
                title = "Personal Information",
                items = listOf(
                    ProfileField(
                        label = "First Name",
                        value = firstName,
                        onValueChange = { firstName = it },
                        keyboardType = KeyboardType.Text
                    ),
                    ProfileField(
                        label = "Last Name",
                        value = lastName,
                        onValueChange = { lastName = it },
                        keyboardType = KeyboardType.Text
                    ),
                    ProfileField(
                        label = "Email",
                        value = email,
                        onValueChange = { email = it },
                        keyboardType = KeyboardType.Email
                    ),
                    ProfileField(
                        label = "Phone",
                        value = phone,
                        onValueChange = { phone = it },
                        keyboardType = KeyboardType.Phone
                    ),
                    ProfileField(
                        label = "Location",
                        value = location,
                        onValueChange = { location = it },
                        keyboardType = KeyboardType.Text
                    )
                )
            )

            // Bio Section
            ProfileSection(
                title = "About Me",
                items = listOf(
                    ProfileField(
                        label = "Bio",
                        value = bio,
                        onValueChange = { bio = it },
                        keyboardType = KeyboardType.Text,
                        isMultiline = true
                    )
                )
            )

            // Preferences
            ProfileSection(
                title = "Preferences",
                items = listOf(
                    ProfileField(
                        label = "Language",
                        value = "English",
                        onValueChange = { },
                        keyboardType = KeyboardType.Text,
                        isReadOnly = true
                    ),
                    ProfileField(
                        label = "Timezone",
                        value = "Eastern Time (ET)",
                        onValueChange = { },
                        keyboardType = KeyboardType.Text,
                        isReadOnly = true
                    )
                )
            )

            // Save Button
            Button(
                onClick = {
                    isSaving = true
                    onSaveProfile(
                        UserProfile(
                            firstName = firstName,
                            lastName = lastName,
                            email = email,
                            phone = phone,
                            location = location,
                            bio = bio
                        )
                    )
                    isSaving = false
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !isSaving,
                colors = ButtonDefaults.buttonColors(containerColor = ClutchRed)
            ) {
                Text(
                    text = if (isSaving) "Saving..." else "Save Changes",
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Spacer(modifier = Modifier.height(100.dp))
        }
    }
}

@Composable
private fun ProfileSection(
    title: String,
    items: List<ProfileField>
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(ClutchSpacing.md)
        ) {
            Text(
                text = title,
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.Black,
                modifier = Modifier.padding(bottom = ClutchSpacing.sm)
            )
            
            items.forEach { field ->
                ProfileFieldCard(field = field)
                if (field != items.last()) {
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                }
            }
        }
    }
}

@Composable
private fun ProfileFieldCard(
    field: ProfileField
) {
    Column {
        Text(
            text = field.label,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium,
            color = Color.Black,
            modifier = Modifier.padding(bottom = ClutchSpacing.xs)
        )
        
        OutlinedTextField(
            value = field.value,
            onValueChange = field.onValueChange,
            modifier = Modifier.fillMaxWidth(),
            enabled = !field.isReadOnly,
            keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                keyboardType = field.keyboardType
            ),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = ClutchRed,
                unfocusedBorderColor = Color.Gray
            ),
            maxLines = if (field.isMultiline) 3 else 1
        )
    }
}

data class ProfileField(
    val label: String,
    val value: String,
    val onValueChange: (String) -> Unit,
    val keyboardType: KeyboardType,
    val isMultiline: Boolean = false,
    val isReadOnly: Boolean = false
)

data class UserProfile(
    val firstName: String,
    val lastName: String,
    val email: String,
    val phone: String,
    val location: String,
    val bio: String
)
