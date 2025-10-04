package com.clutch.app.ui.screens.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsFeedbackScreen(
    onNavigateBack: () -> Unit = {}
) {
    var feedbackText by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("General") }
    var showCategoryPicker by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(ClutchLayoutSpacing.screenPadding),
        verticalArrangement = Arrangement.spacedBy(ClutchSpacing.md)
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
                        contentDescription = "Back"
                    )
                }
                Text(
                    text = "Send Feedback",
                    style = MaterialTheme.typography.headlineMedium
                )
                Spacer(modifier = Modifier.size(48.dp))
            }
        }

        item {
            // Feedback Form
            ClutchCardBasic {
                Column(
                    modifier = Modifier.padding(ClutchSpacing.md)
                ) {
                    Text(
                        text = "Share Your Thoughts",
                        style = MaterialTheme.typography.titleMedium,
                        color = ClutchColors.primary
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.md))
                    
                    // Category Selection
                    OutlinedTextField(
                        value = selectedCategory,
                        onValueChange = { selectedCategory = it },
                        label = { Text("Category") },
                        readOnly = true,
                        enabled = false,
                        trailingIcon = {
                            IconButton(onClick = { showCategoryPicker = true }) {
                                Icon(Icons.Default.KeyboardArrowDown, contentDescription = "Select Category")
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.md))
                    
                    // Feedback Text
                    OutlinedTextField(
                        value = feedbackText,
                        onValueChange = { feedbackText = it },
                        label = { Text("Your Feedback") },
                        placeholder = { Text("Tell us what you think...") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(120.dp),
                        maxLines = 5
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.md))
                    
                    // Submit Button
                    Button(
                        onClick = { /* Submit feedback */ },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Send Feedback")
                    }
                }
            }
        }

        item {
            // Contact Information
            ClutchCardBasic {
                Column(
                    modifier = Modifier.padding(ClutchSpacing.md)
                ) {
                    Text(
                        text = "Other Ways to Contact Us",
                        style = MaterialTheme.typography.titleMedium,
                        color = ClutchColors.primary
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    SettingsItem(
                        icon = Icons.Default.Email,
                        title = "Email Support",
                        subtitle = "support@clutch.com",
                        onClick = { /* Open email */ }
                    )
                    
                    SettingsItem(
                        icon = Icons.Default.Phone,
                        title = "Phone Support",
                        subtitle = "+1 (555) 123-4567",
                        onClick = { /* Open phone */ }
                    )
                }
            }
        }
    }

    // Category Picker Dialog
    if (showCategoryPicker) {
        AlertDialog(
            onDismissRequest = { showCategoryPicker = false },
            title = { Text("Select Category") },
            text = {
                Column {
                    listOf("General", "Bug Report", "Feature Request", "Performance", "UI/UX").forEach { category ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(category)
                            RadioButton(
                                selected = selectedCategory == category,
                                onClick = { 
                                    selectedCategory = category
                                    showCategoryPicker = false
                                }
                            )
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showCategoryPicker = false }) {
                    Text("Cancel")
                }
            }
        )
    }
}
