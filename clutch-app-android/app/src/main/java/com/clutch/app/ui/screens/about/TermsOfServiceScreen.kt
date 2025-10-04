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
 * TermsOfServiceScreen.kt - Terms of Service document
 * 
 * Complete terms of service screen with detailed information about
 * user agreements, service terms, and legal obligations.
 */

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TermsOfServiceScreen(
    onNavigateBack: () -> Unit = {}
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Terms of Service") },
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
                text = "Terms of Service",
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
            TermsSection(
                title = "Agreement to Terms",
                content = "By accessing and using the Clutch mobile application and services, you agree to be bound by these Terms of Service and all applicable laws and regulations."
            )

            // Acceptance of Terms
            TermsSection(
                title = "Acceptance of Terms",
                content = "By creating an account or using our services, you acknowledge that you have read, understood, and agree to be bound by these terms."
            )

            // Service Description
            TermsSection(
                title = "Service Description",
                content = "Clutch provides a platform for automotive service booking, parts ordering, and vehicle maintenance management."
            )

            TermsSubsection(
                title = "Our Services Include",
                items = listOf(
                    "Vehicle service booking and scheduling",
                    "Automotive parts ordering and delivery",
                    "Vehicle maintenance tracking and reminders",
                    "Service provider directory and reviews",
                    "Community features and tips sharing",
                    "Loyalty rewards and points system"
                )
            )

            // User Accounts
            TermsSection(
                title = "User Accounts",
                content = "To access certain features of our service, you must create an account. You are responsible for maintaining the confidentiality of your account."
            )

            TermsSubsection(
                title = "Account Responsibilities",
                items = listOf(
                    "Provide accurate and complete information",
                    "Maintain the security of your password",
                    "Notify us immediately of any unauthorized use",
                    "Be responsible for all activities under your account",
                    "Keep your contact information up to date"
                )
            )

            // Acceptable Use
            TermsSection(
                title = "Acceptable Use",
                content = "You agree to use our services only for lawful purposes and in accordance with these terms."
            )

            TermsSubsection(
                title = "Prohibited Activities",
                items = listOf(
                    "Violating any applicable laws or regulations",
                    "Infringing on intellectual property rights",
                    "Transmitting harmful or malicious content",
                    "Attempting to gain unauthorized access",
                    "Interfering with service operations",
                    "Creating fake accounts or impersonating others"
                )
            )

            // Service Availability
            TermsSection(
                title = "Service Availability",
                content = "We strive to provide reliable service, but we cannot guarantee uninterrupted access. We reserve the right to modify or discontinue services."
            )

            // Payment Terms
            TermsSection(
                title = "Payment Terms",
                content = "Payment for services and products is due at the time of booking or purchase. We accept various payment methods as displayed in the app."
            )

            TermsSubsection(
                title = "Payment Policies",
                items = listOf(
                    "All prices are subject to change without notice",
                    "Payment is processed securely through third-party providers",
                    "Refunds are subject to our refund policy",
                    "You are responsible for all applicable taxes",
                    "Failed payments may result in service suspension"
                )
            )

            // Cancellation and Refunds
            TermsSection(
                title = "Cancellation and Refunds",
                content = "Cancellation and refund policies vary by service type and provider. Please review specific terms at the time of booking."
            )

            // Intellectual Property
            TermsSection(
                title = "Intellectual Property",
                content = "The Clutch app and all content, features, and functionality are owned by Clutch and are protected by copyright, trademark, and other intellectual property laws."
            )

            // Privacy
            TermsSection(
                title = "Privacy",
                content = "Your privacy is important to us. Please review our Privacy Policy, which also governs your use of our services."
            )

            // Limitation of Liability
            TermsSection(
                title = "Limitation of Liability",
                content = "To the maximum extent permitted by law, Clutch shall not be liable for any indirect, incidental, special, consequential, or punitive damages."
            )

            // Indemnification
            TermsSection(
                title = "Indemnification",
                content = "You agree to indemnify and hold harmless Clutch from any claims, damages, or expenses arising from your use of our services or violation of these terms."
            )

            // Termination
            TermsSection(
                title = "Termination",
                content = "We may terminate or suspend your account and access to our services at our sole discretion, without prior notice, for any reason."
            )

            // Changes to Terms
            TermsSection(
                title = "Changes to Terms",
                content = "We reserve the right to modify these terms at any time. We will notify users of significant changes through the app or email."
            )

            // Governing Law
            TermsSection(
                title = "Governing Law",
                content = "These terms are governed by and construed in accordance with the laws of the jurisdiction in which Clutch operates."
            )

            // Contact Information
            TermsSection(
                title = "Contact Information",
                content = "If you have any questions about these Terms of Service, please contact us:"
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
                        value = "legal@clutch.com"
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

            // Acknowledgment
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = ClutchColors.success.copy(alpha = 0.1f)),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
            ) {
                Row(
                    modifier = Modifier.padding(ClutchSpacing.md),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = null,
                        tint = ClutchColors.success,
                        modifier = Modifier.size(24.dp)
                    )
                    
                    Spacer(modifier = Modifier.width(ClutchSpacing.sm))
                    
                    Text(
                        text = "By using our services, you acknowledge that you have read and agree to these Terms of Service.",
                        fontSize = 14.sp,
                        color = ClutchColors.success
                    )
                }
            }

            Spacer(modifier = Modifier.height(100.dp))
        }
    }
}

@Composable
private fun TermsSection(
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
private fun TermsSubsection(
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
