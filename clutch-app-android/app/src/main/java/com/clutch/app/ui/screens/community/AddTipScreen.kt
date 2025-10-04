package com.clutch.app.ui.screens.community

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * AddTipScreen.kt - Add community tip or advice
 * 
 * Complete add tip screen with tip submission, categorization,
 * and community guidelines.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddTipScreen(
    onNavigateBack: () -> Unit = {}
) {
    var tipTitle by remember { mutableStateOf("") }
    var tipContent by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("") }
    var selectedTags by remember { mutableStateOf(setOf<String>()) }
    var isAnonymous by remember { mutableStateOf(false) }
    var isSubmitting by remember { mutableStateOf(false) }

    val categories = listOf(
        TipCategory("maintenance", "Maintenance", "Tips for car maintenance and care"),
        TipCategory("repairs", "Repairs", "DIY repair advice and solutions"),
        TipCategory("parts", "Parts", "Information about car parts and accessories"),
        TipCategory("driving", "Driving", "Safe driving tips and techniques"),
        TipCategory("fuel", "Fuel Efficiency", "Tips to improve fuel economy"),
        TipCategory("safety", "Safety", "Vehicle safety and security advice"),
        TipCategory("general", "General", "General automotive advice")
    )

    val availableTags = listOf(
        "DIY", "Beginner", "Advanced", "Quick Fix", "Safety", "Money Saving",
        "Professional", "Emergency", "Prevention", "Troubleshooting"
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Add Tip") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    TextButton(
                        onClick = {
                            isSubmitting = true
                            // Submit tip
                            isSubmitting = false
                        },
                        enabled = !isSubmitting && tipTitle.isNotEmpty() && tipContent.isNotEmpty()
                    ) {
                        Text(
                            text = if (isSubmitting) "Posting..." else "Post",
                            color = if (isSubmitting) Color.Gray else ClutchRed
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
            // Header
            Text(
                text = "Share Your Knowledge",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )

            Text(
                text = "Help fellow car enthusiasts by sharing your tips and experiences",
                fontSize = 16.sp,
                color = Color.Gray
            )

            // Tip Form
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(ClutchSpacing.md)
                ) {
                    Text(
                        text = "Tip Details",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    // Title
                    OutlinedTextField(
                        value = tipTitle,
                        onValueChange = { tipTitle = it },
                        label = { Text("Tip Title") },
                        placeholder = { Text("Enter a catchy title for your tip") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ClutchRed,
                            unfocusedBorderColor = Color.Gray
                        )
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    // Content
                    OutlinedTextField(
                        value = tipContent,
                        onValueChange = { tipContent = it },
                        label = { Text("Tip Content") },
                        placeholder = { Text("Share your tip, advice, or experience...") },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 6,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = ClutchRed,
                            unfocusedBorderColor = Color.Gray
                        )
                    )
                }
            }

            // Category Selection
            Text(
                text = "Category",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.Black
            )

            categories.forEach { category ->
                TipCategoryCard(
                    category = category,
                    isSelected = selectedCategory == category.id,
                    onSelect = { selectedCategory = category.id }
                )
            }

            // Tags Selection
            Text(
                text = "Tags (Optional)",
                fontSize = 18.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.Black
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(ClutchSpacing.md)
                ) {
                    Text(
                        text = "Add relevant tags to help others find your tip",
                        fontSize = 14.sp,
                        color = Color.Gray
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    // Tags
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(ClutchSpacing.sm)
                    ) {
                        items(availableTags) { tag ->
                            TagChip(
                                tag = tag,
                                isSelected = selectedTags.contains(tag),
                                onToggle = {
                                    selectedTags = if (selectedTags.contains(tag)) {
                                        selectedTags - tag
                                    } else {
                                        selectedTags + tag
                                    }
                                }
                            )
                        }
                    }
                }
            }

            // Privacy Options
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier.padding(ClutchSpacing.md)
                ) {
                    Text(
                        text = "Privacy Options",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.Black
                    )
                    
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = isAnonymous,
                            onCheckedChange = { isAnonymous = it },
                            colors = CheckboxDefaults.colors(
                                checkedColor = ClutchRed
                            )
                        )
                        Spacer(modifier = Modifier.width(ClutchSpacing.sm))
                        Column {
                            Text(
                                text = "Post anonymously",
                                fontSize = 14.sp,
                                color = Color.Black
                            )
                            Text(
                                text = "Your name won't be shown with this tip",
                                fontSize = 12.sp,
                                color = Color.Gray
                            )
                        }
                    }
                }
            }

            // Community Guidelines
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF8F9FA)),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Column(
                    modifier = Modifier.padding(ClutchSpacing.md)
                ) {
                    Text(
                        text = "Community Guidelines",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.Black
                    )
                    Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                    
                    GuidelineItem(
                        icon = Icons.Default.CheckCircle,
                        text = "Share accurate and helpful information"
                    )
                    
                    GuidelineItem(
                        icon = Icons.Default.CheckCircle,
                        text = "Be respectful and constructive"
                    )
                    
                    GuidelineItem(
                        icon = Icons.Default.CheckCircle,
                        text = "Include safety warnings when relevant"
                    )
                    
                    GuidelineItem(
                        icon = Icons.Default.CheckCircle,
                        text = "Use clear and descriptive language"
                    )
                }
            }

            // Submit Button
            Button(
                onClick = {
                    isSubmitting = true
                    // Submit tip
                    isSubmitting = false
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !isSubmitting && tipTitle.isNotEmpty() && tipContent.isNotEmpty(),
                colors = ButtonDefaults.buttonColors(containerColor = ClutchRed)
            ) {
                Text(
                    text = if (isSubmitting) "Posting Tip..." else "Post Tip",
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
private fun TipCategoryCard(
    category: TipCategory,
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
                    text = category.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (isSelected) ClutchRed else Color.Black
                )
                Text(
                    text = category.description,
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
private fun TagChip(
    tag: String,
    isSelected: Boolean,
    onToggle: () -> Unit
) {
    FilterChip(
        onClick = onToggle,
        label = { Text(tag) },
        selected = isSelected,
        colors = FilterChipDefaults.filterChipColors(
            selectedContainerColor = ClutchRed,
            selectedLabelColor = Color.White,
            containerColor = Color.White
        )
    )
}

@Composable
private fun GuidelineItem(
    icon: ImageVector,
    text: String
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
            tint = Color(0xFF4CAF50),
            modifier = Modifier.size(16.dp)
        )
        
        Spacer(modifier = Modifier.width(ClutchSpacing.sm))
        
        Text(
            text = text,
            fontSize = 14.sp,
            color = Color.Black
        )
    }
}

data class TipCategory(
    val id: String,
    val name: String,
    val description: String
)
