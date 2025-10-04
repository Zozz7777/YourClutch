package com.clutch.app.ui.screens.help

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.clutch.app.ui.theme.ClutchColors
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * ContactSupportScreen.kt - Contact support and customer service
 * 
 * Complete contact support screen with multiple contact methods,
 * issue reporting, and support ticket management.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ContactSupportScreen(
    onNavigateBack: () -> Unit = {}
) {
    var selectedIssueType by remember { mutableStateOf("") }
    var subject by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var priority by remember { mutableStateOf("Medium") }
    var isSubmitting by remember { mutableStateOf(false) }

    val issueTypes = listOf(
        IssueType("technical", "Technical Issue", "App crashes, bugs, or technical problems"),
        IssueType("billing", "Billing & Payments", "Payment issues, refunds, or billing questions"),
        IssueType("service", "Service Issues", "Problems with booked services or appointments"),
        IssueType("parts", "Parts & Orders", "Issues with parts orders or delivery"),
        IssueType("account", "Account Issues", "Login problems, profile issues, or account settings"),
        IssueType("general", "General Inquiry", "General questions or feedback")
    )

    val priorities = listOf("Low", "Medium", "High", "Urgent")

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Contact Support") },
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
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(ClutchLayoutSpacing.screenPadding)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(ClutchSpacing.lg)
            ) {
                // Header
                Text(
                    text = "Get Help",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )

                // Quick Contact Options
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Text(
                            text = "Quick Contact",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        ContactOption(
                            icon = Icons.Default.Phone,
                            title = "Call Support",
                            description = "1-800-CLUTCH-1",
                            action = "Call Now"
                        )
                        
                        ContactOption(
                            icon = Icons.Default.Email,
                            title = "Email Support",
                            description = "support@clutch.com",
                            action = "Send Email"
                        )
                        
                        ContactOption(
                            icon = Icons.Default.Chat,
                            title = "Live Chat",
                            description = "Available 24/7",
                            action = "Start Chat"
                        )
                    }
                }

                // Support Form
                Text(
                    text = "Submit a Support Ticket",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black
                )

                // Issue Type Selection
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Text(
                            text = "Issue Type",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        issueTypes.forEach { issueType ->
                            IssueTypeCard(
                                issueType = issueType,
                                isSelected = selectedIssueType == issueType.id,
                                onSelect = { selectedIssueType = issueType.id }
                            )
                            if (issueType != issueTypes.last()) {
                                Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                            }
                        }
                    }
                }

                // Form Fields
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Text(
                            text = "Issue Details",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        // Subject
                        OutlinedTextField(
                            value = subject,
                            onValueChange = { subject = it },
                            label = { Text("Subject") },
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = ClutchRed,
                                unfocusedBorderColor = Color.Gray
                            )
                        )
                        
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        // Description
                        OutlinedTextField(
                            value = description,
                            onValueChange = { description = it },
                            label = { Text("Description") },
                            modifier = Modifier.fillMaxWidth(),
                            minLines = 4,
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = ClutchRed,
                                unfocusedBorderColor = Color.Gray
                            )
                        )
                        
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        // Priority
                        OutlinedTextField(
                            value = priority,
                            onValueChange = { priority = it },
                            label = { Text("Priority") },
                            modifier = Modifier.fillMaxWidth(),
                            readOnly = true,
                            trailingIcon = {
                                Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                            },
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = ClutchRed,
                                unfocusedBorderColor = Color.Gray
                            )
                        )
                    }
                }

                // Submit Button
                Button(
                    onClick = {
                        isSubmitting = true
                        // Submit support ticket
                        isSubmitting = false
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isSubmitting && subject.isNotEmpty() && description.isNotEmpty(),
                    colors = ButtonDefaults.buttonColors(containerColor = ClutchRed)
                ) {
                    Text(
                        text = if (isSubmitting) "Submitting..." else "Submit Ticket",
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                // Support Hours
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md)
                    ) {
                        Text(
                            text = "Support Hours",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        
                        SupportHour(
                            day = "Monday - Friday",
                            hours = "9:00 AM - 6:00 PM EST"
                        )
                        
                        SupportHour(
                            day = "Saturday",
                            hours = "10:00 AM - 4:00 PM EST"
                        )
                        
                        SupportHour(
                            day = "Sunday",
                            hours = "Closed"
                        )
                    }
                }

                Spacer(modifier = Modifier.height(100.dp))
            }
        }
    }

@Composable
private fun ContactOption(
    icon: ImageVector,
    title: String,
    description: String,
    action: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
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
                imageVector = icon,
                contentDescription = null,
                tint = ClutchRed,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.width(ClutchSpacing.md))
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.Black
                )
                Text(
                    text = description,
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
            
            TextButton(
                onClick = { /* Handle contact action */ }
            ) {
                Text(
                    text = action,
                    color = ClutchRed
                )
            }
        }
    }
}

@Composable
private fun IssueTypeCard(
    issueType: IssueType,
    isSelected: Boolean,
    onSelect: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onSelect() },
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) ClutchRed.copy(alpha = 0.1f) else Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(ClutchSpacing.md),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = issueType.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (isSelected) ClutchRed else Color.Black
                )
                Text(
                    text = issueType.description,
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }
            
            if (isSelected) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = null,
                    tint = ClutchRed
                )
            }
        }
    }
}

@Composable
private fun SupportHour(
    day: String,
    hours: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = ClutchSpacing.xs),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = day,
            fontSize = 14.sp,
            color = Color.Black
        )
        Text(
            text = hours,
            fontSize = 14.sp,
            color = Color.Gray
        )
    }
}

data class IssueType(
    val id: String,
    val name: String,
    val description: String
)
