package com.clutch.app.ui.screens.about

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.ui.components.*
import com.clutch.app.ui.theme.*

/**
 * PrivacyPolicyScreen.kt - Privacy Policy document
 * 
 * Complete privacy policy screen with detailed information about
 * data collection, usage, and user rights.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PrivacyPolicyScreen(
    onNavigateBack: () -> Unit = {}
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Privacy Policy") },
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
                text = "Privacy Policy",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )

            Text(
                text = "Last updated: December 2024",
                fontSize = 14.sp,
                color = Color.Gray,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )

            // Introduction
            PolicySection(
                title = "Introduction",
                content = "Clutch is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and services."
            )

            // Information We Collect
            PolicySection(
                title = "Information We Collect",
                content = "We collect information you provide directly to us, such as when you create an account, book services, or contact us for support."
            )

            PolicySubsection(
                title = "Personal Information",
                items = listOf(
                    "Name and contact information",
                    "Email address and phone number",
                    "Vehicle information and maintenance history",
                    "Payment and billing information",
                    "Profile pictures and preferences"
                )
            )

            PolicySubsection(
                title = "Usage Information",
                items = listOf(
                    "App usage patterns and preferences",
                    "Device information and operating system",
                    "Location data (with your permission)",
                    "Crash reports and performance data",
                    "Communication preferences"
                )
            )

            // How We Use Information
            PolicySection(
                title = "How We Use Your Information",
                content = "We use the information we collect to provide, maintain, and improve our services."
            )

            PolicySubsection(
                title = "Service Provision",
                items = listOf(
                    "Process service bookings and orders",
                    "Provide customer support",
                    "Send important service updates",
                    "Personalize your experience",
                    "Process payments and transactions"
                )
            )

            PolicySubsection(
                title = "Communication",
                items = listOf(
                    "Send service reminders and notifications",
                    "Provide customer support",
                    "Send promotional offers (with consent)",
                    "Share important updates",
                    "Respond to your inquiries"
                )
            )

            // Information Sharing
            PolicySection(
                title = "Information Sharing",
                content = "We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy."
            )

            PolicySubsection(
                title = "Service Providers",
                items = listOf(
                    "Payment processors for transaction handling",
                    "Cloud storage providers for data security",
                    "Analytics services for app improvement",
                    "Customer support platforms",
                    "Marketing partners (with consent)"
                )
            )

            // Data Security
            PolicySection(
                title = "Data Security",
                content = "We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction."
            )

            PolicySubsection(
                title = "Security Measures",
                items = listOf(
                    "Encryption of data in transit and at rest",
                    "Regular security audits and updates",
                    "Access controls and authentication",
                    "Secure data centers and infrastructure",
                    "Employee training on data protection"
                )
            )

            // Your Rights
            PolicySection(
                title = "Your Rights",
                content = "You have certain rights regarding your personal information, including the right to access, update, or delete your data."
            )

            PolicySubsection(
                title = "Data Rights",
                items = listOf(
                    "Access your personal information",
                    "Correct inaccurate or incomplete data",
                    "Delete your account and data",
                    "Opt out of marketing communications",
                    "Data portability and export"
                )
            )

            // Cookies and Tracking
            PolicySection(
                title = "Cookies and Tracking",
                content = "We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content."
            )

            // Children's Privacy
            PolicySection(
                title = "Children's Privacy",
                content = "Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13."
            )

            // Changes to Policy
            PolicySection(
                title = "Changes to This Policy",
                content = "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Last updated' date."
            )

            // Contact Information
            PolicySection(
                title = "Contact Us",
                content = "If you have any questions about this Privacy Policy, please contact us at:"
            )

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = ClutchColors.card),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Column(
                    modifier = Modifier.padding(ClutchSpacing.md)
                ) {
                    ContactInfo(
                        icon = Icons.Default.Email,
                        label = "Email",
                        value = "privacy@clutch.com"
                    )
                    
                    ContactInfo(
                        icon = Icons.Default.Phone,
                        label = "Phone",
                        value = "1-800-CLUTCH-1"
                    )
                    
                    ContactInfo(
                        icon = Icons.Default.LocationOn,
                        label = "Address",
                        value = "123 Clutch Street, Tech City, TC 12345"
                    )
                }
            }

            Spacer(modifier = Modifier.height(100.dp))
        }
    }
}

@Composable
private fun PolicySection(
    title: String,
    content: String
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
                color = Color.Black
            )
            
            Spacer(modifier = Modifier.height(ClutchSpacing.sm))
            
            Text(
                text = content,
                fontSize = 14.sp,
                color = Color.Black,
                lineHeight = 20.sp
            )
        }
    }
}

@Composable
private fun PolicySubsection(
    title: String,
    items: List<String>
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFF8F9FA)),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(
            modifier = Modifier.padding(ClutchSpacing.md)
        ) {
            Text(
                text = title,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black
            )
            
            Spacer(modifier = Modifier.height(ClutchSpacing.sm))
            
            items.forEach { item ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 2.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Text(
                        text = "• ",
                        fontSize = 14.sp,
                        color = ClutchRed
                    )
                    Text(
                        text = item,
                        fontSize = 14.sp,
                        color = Color.Black,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
    }
}

@Composable
private fun ContactInfo(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String
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
            modifier = Modifier.size(20.dp)
        )
        
        Spacer(modifier = Modifier.width(ClutchSpacing.sm))
        
        Column {
            Text(
                text = label,
                fontSize = 12.sp,
                color = Color.Gray
            )
            Text(
                text = value,
                fontSize = 14.sp,
                color = Color.Black
            )
        }
    }
}
