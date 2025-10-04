package com.clutch.app.ui.screens.help

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * UserGuideScreen.kt - Comprehensive in-app documentation
 * 
 * Complete user guide with detailed instructions, tips,
 * and troubleshooting information for all app features.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserGuideScreen(
    onNavigateBack: () -> Unit = {},
    onSectionSelected: (GuideSection) -> Unit = {}
) {
    val sections = getGuideSections()
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("User Guide") },
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
                .background(Color(0xFFF0F2F5))
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Welcome Section
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = ClutchRed),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Default.Book,
                            contentDescription = "Guide",
                            tint = Color.White,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Welcome to Clutch",
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Your complete guide to using the Clutch app",
                            fontSize = 16.sp,
                            color = Color.White.copy(alpha = 0.9f),
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }
            
            // Quick Start
            item {
                GuideSectionCard(
                    title = "Quick Start",
                    description = "Get up and running in minutes",
                    icon = Icons.Default.RocketLaunch,
                    items = listOf(
                        "Setting up your account",
                        "Adding your first car",
                        "Booking your first service"
                    ),
                    onClick = { onSectionSelected(sections.find { it.id == "quick_start" }!!) }
                )
            }
            
            // Main Sections
            items(sections) { section ->
                GuideSectionCard(
                    title = section.title,
                    description = section.description,
                    icon = section.icon,
                    items = section.subsections.map { it.title },
                    onClick = { onSectionSelected(section) }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GuideSectionCard(
    title: String,
    description: String,
    icon: ImageVector,
    items: List<String>,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = icon,
                contentDescription = title,
                tint = ClutchRed,
                modifier = Modifier.size(32.dp)
            )
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color.Black
                )
                Text(
                    text = description,
                    fontSize = 14.sp,
                    color = Color.Gray,
                    modifier = Modifier.padding(vertical = 4.dp)
                )
                
                // Show first few items
                items.take(3).forEach { item ->
                    Text(
                        text = "• $item",
                        fontSize = 12.sp,
                        color = Color.Gray,
                        modifier = Modifier.padding(vertical = 1.dp)
                    )
                }
                
                if (items.size > 3) {
                    Text(
                        text = "• And ${items.size - 3} more...",
                        fontSize = 12.sp,
                        color = ClutchRed,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
            
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = "Navigate",
                tint = Color.Gray,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GuideSectionDetailScreen(
    section: GuideSection,
    onNavigateBack: () -> Unit = {},
    onSubsectionSelected: (GuideSubsection) -> Unit = {}
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(section.title) },
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
                .background(Color(0xFFF0F2F5))
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Section Header
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = ClutchRed),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = section.icon,
                                contentDescription = section.title,
                                tint = Color.White,
                                modifier = Modifier.size(32.dp)
                            )
                            Spacer(modifier = Modifier.width(12.dp))
                            Text(
                                text = section.title,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = section.description,
                            fontSize = 14.sp,
                            color = Color.White.copy(alpha = 0.9f)
                        )
                    }
                }
            }
            
            // Subsections
            items(section.subsections) { subsection ->
                GuideSubsectionCard(
                    subsection = subsection,
                    onClick = { onSubsectionSelected(subsection) }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GuideSubsectionCard(
    subsection: GuideSubsection,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = subsection.title,
                fontSize = 16.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color.Black
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = subsection.description,
                fontSize = 14.sp,
                color = Color.Gray
            )
            
            if (subsection.tips.isNotEmpty()) {
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "💡 ${subsection.tips.first()}",
                    fontSize = 12.sp,
                    color = ClutchRed,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GuideContentScreen(
    subsection: GuideSubsection,
    onNavigateBack: () -> Unit = {}
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(subsection.title) },
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
                .background(Color(0xFFF0F2F5))
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Content
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp)
                    ) {
                        Text(
                            text = subsection.title,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.Black
                        )
                        
                        Spacer(modifier = Modifier.height(8.dp))
                        
                        Text(
                            text = subsection.description,
                            fontSize = 16.sp,
                            color = Color.Black,
                            lineHeight = 24.sp
                        )
                        
                        if (subsection.steps.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            Text(
                                text = "Step-by-Step Instructions:",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.Black
                            )
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            subsection.steps.forEachIndexed { index, step ->
                                Row(
                                    modifier = Modifier.padding(vertical = 4.dp),
                                    verticalAlignment = Alignment.Top
                                ) {
                                    Text(
                                        text = "${index + 1}.",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = ClutchRed
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = step,
                                        fontSize = 14.sp,
                                        color = Color.Black,
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                            }
                        }
                        
                        if (subsection.tips.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            Text(
                                text = "💡 Pro Tips:",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.Black
                            )
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            subsection.tips.forEach { tip ->
                                Row(
                                    modifier = Modifier.padding(vertical = 2.dp),
                                    verticalAlignment = Alignment.Top
                                ) {
                                    Text(
                                        text = "• ",
                                        fontSize = 14.sp,
                                        color = ClutchRed
                                    )
                                    Text(
                                        text = tip,
                                        fontSize = 14.sp,
                                        color = Color.Black,
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                            }
                        }
                        
                        if (subsection.troubleshooting.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            Text(
                                text = "🔧 Troubleshooting:",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.Black
                            )
                            
                            Spacer(modifier = Modifier.height(8.dp))
                            
                            subsection.troubleshooting.forEach { issue ->
                                Row(
                                    modifier = Modifier.padding(vertical = 2.dp),
                                    verticalAlignment = Alignment.Top
                                ) {
                                    Text(
                                        text = "• ",
                                        fontSize = 14.sp,
                                        color = Color.Red
                                    )
                                    Text(
                                        text = issue,
                                        fontSize = 14.sp,
                                        color = Color.Black,
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

data class GuideSection(
    val id: String,
    val title: String,
    val description: String,
    val icon: ImageVector,
    val subsections: List<GuideSubsection>
)

data class GuideSubsection(
    val id: String,
    val title: String,
    val description: String,
    val steps: List<String>,
    val tips: List<String>,
    val troubleshooting: List<String>
)

private fun getGuideSections(): List<GuideSection> {
    return listOf(
        GuideSection(
            id = "getting_started",
            title = "Getting Started",
            description = "Learn the basics of using Clutch",
            icon = Icons.Default.PlayArrow,
            subsections = listOf(
                GuideSubsection(
                    id = "account_setup",
                    title = "Setting Up Your Account",
                    description = "Create your Clutch account and complete your profile setup.",
                    steps = listOf(
                        "Download the Clutch app from your app store",
                        "Open the app and tap 'Sign Up'",
                        "Enter your email address and create a password",
                        "Verify your email address",
                        "Complete your profile with personal information",
                        "Add a profile picture (optional)"
                    ),
                    tips = listOf(
                        "Use a strong password with at least 8 characters",
                        "Keep your email address up to date for important notifications",
                        "Your profile picture helps with account security"
                    ),
                    troubleshooting = listOf(
                        "If you don't receive the verification email, check your spam folder",
                        "Make sure you have a stable internet connection during signup",
                        "Contact support if you're having trouble with account creation"
                    )
                ),
                GuideSubsection(
                    id = "first_car",
                    title = "Adding Your First Car",
                    description = "Add your car to start tracking maintenance and services.",
                    steps = listOf(
                        "Tap the 'Cars' tab in the bottom navigation",
                        "Tap the '+' button to add a new car",
                        "Enter your car's make, model, and year",
                        "Add your license plate number",
                        "Upload photos of your car",
                        "Set your car's current mileage"
                    ),
                    tips = listOf(
                        "Take clear photos of your car for better service matching",
                        "Keep your mileage updated for accurate maintenance tracking",
                        "You can add multiple cars to your account"
                    ),
                    troubleshooting = listOf(
                        "If your car model isn't listed, select the closest match",
                        "Make sure your photos are clear and well-lit",
                        "Double-check your license plate number for accuracy"
                    )
                )
            )
        ),
        GuideSection(
            id = "car_management",
            title = "Car Management",
            description = "Managing your vehicles and maintenance",
            icon = Icons.Default.DirectionsCar,
            subsections = listOf(
                GuideSubsection(
                    id = "service_history",
                    title = "Service History",
                    description = "Track and manage your car's service history.",
                    steps = listOf(
                        "Go to the 'Cars' tab and select your car",
                        "Tap on 'Service History'",
                        "View past services and maintenance records",
                        "Add new service records manually",
                        "Upload service receipts and documents"
                    ),
                    tips = listOf(
                        "Keep all service receipts for warranty purposes",
                        "Update service history immediately after each service",
                        "Use the search function to find specific services"
                    ),
                    troubleshooting = listOf(
                        "If service records are missing, contact your service provider",
                        "Make sure to save receipts in a safe place",
                        "Contact support if you can't find old service records"
                    )
                ),
                GuideSubsection(
                    id = "maintenance_reminders",
                    title = "Maintenance Reminders",
                    description = "Set up and manage maintenance reminders for your car.",
                    steps = listOf(
                        "Go to your car's details page",
                        "Tap on 'Maintenance'",
                        "Set up reminder schedules for different services",
                        "Choose notification preferences",
                        "Update maintenance status after completion"
                    ),
                    tips = listOf(
                        "Set reminders based on your car's manual recommendations",
                        "Use mileage-based reminders for accurate timing",
                        "Review and update reminders regularly"
                    ),
                    troubleshooting = listOf(
                        "If reminders aren't working, check your notification settings",
                        "Make sure your car's mileage is up to date",
                        "Contact support if reminders aren't appearing"
                    )
                )
            )
        ),
        GuideSection(
            id = "service_booking",
            title = "Service Booking",
            description = "Booking and managing car services",
            icon = Icons.Default.Build,
            subsections = listOf(
                GuideSubsection(
                    id = "book_service",
                    title = "Booking a Service",
                    description = "How to book car services through the app.",
                    steps = listOf(
                        "Tap the 'Services' tab",
                        "Select the type of service you need",
                        "Choose a service provider from the list",
                        "Select your preferred date and time",
                        "Add any special notes or requirements",
                        "Confirm your booking"
                    ),
                    tips = listOf(
                        "Book services in advance for better availability",
                        "Read reviews before selecting a service provider",
                        "Add detailed notes about your car's issues"
                    ),
                    troubleshooting = listOf(
                        "If no time slots are available, try different dates",
                        "Contact the service provider directly for urgent repairs",
                        "Check your internet connection if booking fails"
                    )
                ),
                GuideSubsection(
                    id = "manage_appointments",
                    title = "Managing Appointments",
                    description = "View, reschedule, or cancel your service appointments.",
                    steps = listOf(
                        "Go to the 'Services' tab",
                        "Tap on 'My Appointments'",
                        "View your upcoming appointments",
                        "Tap on an appointment to see details",
                        "Use the options to reschedule or cancel"
                    ),
                    tips = listOf(
                        "Reschedule appointments at least 24 hours in advance",
                        "Keep your contact information up to date",
                        "Arrive on time for your appointments"
                    ),
                    troubleshooting = listOf(
                        "If you can't reschedule, contact the service provider directly",
                        "Check your email for appointment confirmations",
                        "Contact support if appointments aren't showing up"
                    )
                )
            )
        ),
        GuideSection(
            id = "parts_orders",
            title = "Parts & Orders",
            description = "Finding and ordering car parts",
            icon = Icons.Default.ShoppingCart,
            subsections = listOf(
                GuideSubsection(
                    id = "find_parts",
                    title = "Finding Car Parts",
                    description = "Search and find the right parts for your car.",
                    steps = listOf(
                        "Go to the 'Parts' tab",
                        "Enter your car's details or scan VIN",
                        "Browse available parts by category",
                        "Use filters to narrow down results",
                        "Compare prices and specifications",
                        "Read reviews and ratings"
                    ),
                    tips = listOf(
                        "Use your car's VIN for the most accurate results",
                        "Compare prices from different suppliers",
                        "Check compatibility before purchasing"
                    ),
                    troubleshooting = listOf(
                        "If parts aren't found, try different search terms",
                        "Contact support if you're unsure about compatibility",
                        "Check if the part is available in your region"
                    )
                ),
                GuideSubsection(
                    id = "place_order",
                    title = "Placing Orders",
                    description = "Complete the ordering process for car parts.",
                    steps = listOf(
                        "Select the parts you want to order",
                        "Add items to your cart",
                        "Review your order and quantities",
                        "Choose your delivery method",
                        "Enter your shipping address",
                        "Select payment method and complete order"
                    ),
                    tips = listOf(
                        "Double-check quantities before ordering",
                        "Choose express delivery for urgent parts",
                        "Keep your shipping address up to date"
                    ),
                    troubleshooting = listOf(
                        "If payment fails, check your payment method",
                        "Contact support if you can't complete the order",
                        "Verify your shipping address is correct"
                    )
                )
            )
        ),
        GuideSection(
            id = "loyalty_rewards",
            title = "Loyalty & Rewards",
            description = "Earning and redeeming loyalty points",
            icon = Icons.Default.CardGiftcard,
            subsections = listOf(
                GuideSubsection(
                    id = "earn_points",
                    title = "Earning Points",
                    description = "Learn how to earn loyalty points in the app.",
                    steps = listOf(
                        "Complete your profile setup",
                        "Book services through the app",
                        "Order parts and accessories",
                        "Leave reviews for services",
                        "Refer friends to the app",
                        "Participate in special promotions"
                    ),
                    tips = listOf(
                        "Points are awarded after service completion",
                        "Higher-value services earn more points",
                        "Check the app regularly for bonus point opportunities"
                    ),
                    troubleshooting = listOf(
                        "If points aren't credited, contact support",
                        "Make sure you're logged into the correct account",
                        "Points may take 24-48 hours to appear"
                    )
                ),
                GuideSubsection(
                    id = "redeem_rewards",
                    title = "Redeeming Rewards",
                    description = "How to redeem your loyalty points for rewards.",
                    steps = listOf(
                        "Go to the 'Loyalty' tab",
                        "Browse available rewards",
                        "Check the points required for each reward",
                        "Select the reward you want",
                        "Confirm your redemption",
                        "Use your reward code or discount"
                    ),
                    tips = listOf(
                        "Save points for higher-value rewards",
                        "Check reward expiration dates",
                        "Some rewards have limited availability"
                    ),
                    troubleshooting = listOf(
                        "If redemption fails, check your points balance",
                        "Contact support if reward codes don't work",
                        "Make sure rewards haven't expired"
                    )
                )
            )
        ),
        GuideSection(
            id = "settings_profile",
            title = "Settings & Profile",
            description = "Managing your account and preferences",
            icon = Icons.Default.Settings,
            subsections = listOf(
                GuideSubsection(
                    id = "profile_management",
                    title = "Profile Management",
                    description = "Update your personal information and preferences.",
                    steps = listOf(
                        "Go to the 'Profile' tab",
                        "Tap on 'Edit Profile'",
                        "Update your personal information",
                        "Change your profile picture",
                        "Update your contact details",
                        "Save your changes"
                    ),
                    tips = listOf(
                        "Keep your information up to date",
                        "Use a clear profile picture",
                        "Verify your contact information regularly"
                    ),
                    troubleshooting = listOf(
                        "If changes don't save, check your internet connection",
                        "Contact support if you can't update your profile",
                        "Make sure all required fields are filled"
                    )
                ),
                GuideSubsection(
                    id = "notification_settings",
                    title = "Notification Settings",
                    description = "Customize your notification preferences.",
                    steps = listOf(
                        "Go to 'Settings' in your profile",
                        "Tap on 'Notifications'",
                        "Choose your notification preferences",
                        "Select notification types you want to receive",
                        "Set quiet hours if desired",
                        "Test your notification settings"
                    ),
                    tips = listOf(
                        "Enable important notifications for services and appointments",
                        "Use quiet hours to avoid notifications during sleep",
                        "Regularly review your notification settings"
                    ),
                    troubleshooting = listOf(
                        "If notifications aren't working, check app permissions",
                        "Make sure your device isn't in Do Not Disturb mode",
                        "Contact support if notifications still don't work"
                    )
                )
            )
        )
    )
}
