package com.clutch.app.ui.screens.help

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * FAQScreen.kt - Frequently Asked Questions
 * 
 * Complete FAQ screen with searchable questions and answers,
 * categorized help topics, and expandable content.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FAQScreen(
    onNavigateBack: () -> Unit = {}
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("all") }
    var expandedItems by remember { mutableStateOf(setOf<String>()) }

    val categories = listOf(
        FAQCategory("all", "All Questions"),
        FAQCategory("account", "Account"),
        FAQCategory("services", "Services"),
        FAQCategory("parts", "Parts & Orders"),
        FAQCategory("billing", "Billing"),
        FAQCategory("technical", "Technical")
    )

    val faqItems = listOf(
        FAQItem(
            id = "1",
            category = "account",
            question = "How do I create an account?",
            answer = "To create an account, tap 'Sign Up' on the login screen, enter your email and password, and follow the verification process."
        ),
        FAQItem(
            id = "2",
            category = "account",
            question = "How do I reset my password?",
            answer = "Tap 'Forgot Password' on the login screen, enter your email, and follow the instructions sent to your email."
        ),
        FAQItem(
            id = "3",
            category = "services",
            question = "How do I book a service?",
            answer = "Go to the 'Book Service' tab, select your service type, choose a date and time, and confirm your booking."
        ),
        FAQItem(
            id = "4",
            category = "services",
            question = "Can I cancel a service booking?",
            answer = "Yes, you can cancel a service booking up to 24 hours before the scheduled time through the 'My Bookings' section."
        ),
        FAQItem(
            id = "5",
            category = "parts",
            question = "How do I order car parts?",
            answer = "Navigate to the 'Order Parts' section, search for the part you need, add it to your cart, and proceed to checkout."
        ),
        FAQItem(
            id = "6",
            category = "parts",
            question = "What is the return policy for parts?",
            answer = "Parts can be returned within 30 days of purchase if they are unused and in original packaging."
        ),
        FAQItem(
            id = "7",
            category = "billing",
            question = "What payment methods do you accept?",
            answer = "We accept all major credit cards, PayPal, and digital wallets like Apple Pay and Google Pay."
        ),
        FAQItem(
            id = "8",
            category = "billing",
            question = "How do I get a refund?",
            answer = "Contact our support team with your order number and reason for refund. Refunds are processed within 5-7 business days."
        ),
        FAQItem(
            id = "9",
            category = "technical",
            question = "The app is not working properly. What should I do?",
            answer = "Try closing and reopening the app, check your internet connection, or restart your device. If the problem persists, contact support."
        ),
        FAQItem(
            id = "10",
            category = "technical",
            question = "How do I update the app?",
            answer = "Go to your device's app store (Google Play Store or Apple App Store) and tap 'Update' next to the Clutch app."
        )
    )

    val filteredItems = faqItems.filter { item ->
        (selectedCategory == "all" || item.category == selectedCategory) &&
        (searchQuery.isEmpty() || 
         item.question.contains(searchQuery, ignoreCase = true) ||
         item.answer.contains(searchQuery, ignoreCase = true))
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("FAQ") },
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
                Text(
                    text = "Frequently Asked Questions",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.Black
                )
            }

            item {
                // Search Bar
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { searchQuery = it },
                    placeholder = { Text("Search questions...") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = ClutchRed,
                        unfocusedBorderColor = Color.Gray
                    )
                )
            }

            item {
                // Category Filter
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(ClutchSpacing.sm)
                ) {
                    items(categories) { category ->
                        CategoryChip(
                            category = category,
                            isSelected = selectedCategory == category.id,
                            onSelect = { selectedCategory = category.id }
                        )
                    }
                }
            }

            item {
                // Results Count
                Text(
                    text = "${filteredItems.size} questions found",
                    fontSize = 14.sp,
                    color = Color.Gray
                )
            }

            items(filteredItems) { item ->
                FAQItemCard(
                    item = item,
                    isExpanded = expandedItems.contains(item.id),
                    onToggle = {
                        expandedItems = if (expandedItems.contains(item.id)) {
                            expandedItems - item.id
                        } else {
                            expandedItems + item.id
                        }
                    }
                )
            }

            item {
                // Contact Support
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(ClutchSpacing.md),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "Still need help?",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.Black
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        Text(
                            text = "Can't find what you're looking for? Contact our support team.",
                            fontSize = 14.sp,
                            color = Color.Gray,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                        Spacer(modifier = Modifier.height(ClutchSpacing.sm))
                        Button(
                            onClick = { /* Navigate to contact support */ },
                            colors = ButtonDefaults.buttonColors(containerColor = ClutchRed)
                        ) {
                            Text(
                                text = "Contact Support",
                                color = Color.White
                            )
                        }
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
private fun CategoryChip(
    category: FAQCategory,
    isSelected: Boolean,
    onSelect: () -> Unit
) {
    FilterChip(
        onClick = onSelect,
        label = { Text(category.name) },
        selected = isSelected,
        colors = FilterChipDefaults.filterChipColors(
            selectedContainerColor = ClutchRed,
            selectedLabelColor = Color.White,
            containerColor = Color.White
        )
    )
}

@Composable
private fun FAQItemCard(
    item: FAQItem,
    isExpanded: Boolean,
    onToggle: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onToggle() },
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
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
                        text = item.question,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.Black
                    )
                }
                
                Icon(
                    imageVector = if (isExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = null,
                    tint = ClutchRed
                )
            }
            
            if (isExpanded) {
                HorizontalDivider(color = ClutchColors.mutedForeground)
                Text(
                    text = item.answer,
                    fontSize = 14.sp,
                    color = Color.Black,
                    modifier = Modifier.padding(ClutchSpacing.md)
                )
            }
        }
    }
}

data class FAQCategory(
    val id: String,
    val name: String
)

data class FAQItem(
    val id: String,
    val category: String,
    val question: String,
    val answer: String
)
