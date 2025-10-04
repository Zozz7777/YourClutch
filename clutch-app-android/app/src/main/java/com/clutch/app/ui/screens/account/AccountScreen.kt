package com.clutch.app.ui.screens.account

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.ui.platform.LocalLayoutDirection
import com.clutch.app.R
import com.clutch.app.ui.theme.*
import com.clutch.app.utils.TranslationManager
import com.clutch.app.utils.ThemeManager
import com.clutch.app.utils.LanguageManager
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.hilt.navigation.compose.hiltViewModel
import com.clutch.app.ui.screens.DashboardViewModel
import com.clutch.app.data.model.User
import com.clutch.app.data.model.UserPreferences
import com.clutch.app.data.model.NotificationPreferences
import androidx.compose.ui.platform.LocalContext

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AccountScreen(
    onNavigateToSettings: () -> Unit = {},
    onNavigateToAccountSettings: () -> Unit = {},
    onNavigateToWallet: () -> Unit = {},
    onNavigateToSavedAddresses: () -> Unit = {},
    onNavigateToCars: () -> Unit = {},
    onNavigateToHelp: () -> Unit = {},
    onNavigateToAbout: () -> Unit = {},
    onSignOut: () -> Unit = {},
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val currentLanguage = TranslationManager.getCurrentLanguage()
    val layoutDirection = if (currentLanguage == "ar") LayoutDirection.Rtl else LayoutDirection.Ltr
    
    // Theme and language state
    var isDarkTheme by remember { mutableStateOf(ThemeManager.isDarkTheme(context)) }
    var currentLang by remember { mutableStateOf(LanguageManager.getCurrentLanguage()) }
    
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

    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(ClutchColors.background),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
        item {
                // Header with profile info - Clickable to account settings
                Card(
                    onClick = onNavigateToAccountSettings,
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Profile Picture and Name
                Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.weight(1f)
                ) {
                    // Profile Picture
                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .clip(CircleShape)
                                    .background(ClutchRed.copy(alpha = 0.1f)),
                        contentAlignment = Alignment.Center
                    ) {
                                if (user?.profileImage != null) {
                                    Icon(
                                        imageVector = Icons.Default.Person,
                                        contentDescription = stringResource(R.string.profile_picture),
                                        tint = colors.primary,
                                        modifier = Modifier.size(30.dp)
                                    )
                                } else {
                        Icon(
                            imageVector = Icons.Default.Person,
                                        contentDescription = stringResource(R.string.profile),
                                        tint = colors.primary,
                            modifier = Modifier.size(30.dp)
                        )
                                }
                    }
                    
                            Spacer(modifier = Modifier.width(16.dp))
                    
                            Column {
                    Text(
                                    text = user?.let { "${it.firstName} ${it.lastName}" } ?: stringResource(R.string.guest_user),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.foreground
                    )
                                Text(
                                    text = user?.email ?: stringResource(R.string.guest_email),
                                    fontSize = 14.sp,
                                    color = colors.mutedForeground
                                )
                            }
                        }
                        
                        // Edit Profile Icon
                    Icon(
                            imageVector = Icons.Default.Edit,
                            contentDescription = stringResource(R.string.edit_profile),
                        tint = colors.primary,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }
        }
        
        item {
                // Quick Actions Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                    // Wallet Card
                Card(
                        onClick = onNavigateToWallet,
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                        shape = RoundedCornerShape(12.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                                imageVector = Icons.Default.AccountBalanceWallet,
                                contentDescription = stringResource(R.string.wallet),
                            tint = colors.primary,
                            modifier = Modifier.size(32.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                                text = stringResource(R.string.wallet),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                                color = colors.primary,
                                textAlign = TextAlign.Center
                            )
                            Text(
                                text = "Balance: $0.00",
                                fontSize = 12.sp,
                                color = colors.mutedForeground,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                    
                    // Your Cars Card
                Card(
                        onClick = onNavigateToCars,
                    modifier = Modifier.weight(1f),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                        shape = RoundedCornerShape(12.dp),
                        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                                imageVector = Icons.Default.DirectionsCar,
                                contentDescription = "Your Cars",
                            tint = colors.primary,
                            modifier = Modifier.size(32.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                                text = "Your Cars",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                                color = colors.primary,
                                textAlign = TextAlign.Center
                            )
                            Text(
                                text = "${uiState.cars.size} cars",
                                fontSize = 12.sp,
                                color = colors.mutedForeground,
                                textAlign = TextAlign.Center
                        )
                    }
                }
            }
        }
            
            item {
                // Settings Card
                Card(
                    onClick = onNavigateToSettings,
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Settings",
                            tint = colors.primary,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Settings",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = colors.foreground
                            )
                            Text(
                                text = "App preferences and configuration",
                                fontSize = 14.sp,
                                color = colors.mutedForeground
                            )
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
        
        // New Order Management Cards
        item {
            Text(
                text = "Orders & Shopping",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black,
                modifier = Modifier.padding(horizontal = 24.dp, vertical = 16.dp)
            )
        }
        
        item {
            // Pending Orders Card - Amazon Style
            Card(
                onClick = { /* Navigate to pending orders */ },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    // Header with title and see all
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Your Orders",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.foreground
                        )
                        Text(
                            text = "See all",
                            fontSize = 14.sp,
                            color = Color.Blue
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    // Order cards carousel
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(2) { index ->
                            OrderCard(
                                orderNumber = "Order #${1001 + index}",
                                status = if (index == 0) "Processing" else "Shipped",
                                items = if (index == 0) 2 else 1
                            )
                        }
                    }
                }
            }
        }
        
        item {
            // Buy Again Card - Amazon Style
            Card(
                onClick = { /* Navigate to buy again */ },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    // Header with title and see all
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Buy Again",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.foreground
                        )
                        Text(
                            text = "See all",
                            fontSize = 14.sp,
                            color = Color.Blue
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Text(
                        text = "Reorder soon",
                        fontSize = 14.sp,
                        color = colors.foreground
                    )
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    // Product cards carousel
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(4) { index ->
                            ProductCard(
                                productName = listOf("Engine Oil", "Brake Pads", "Air Filter", "Spark Plugs")[index],
                                price = listOf("EGP 150", "EGP 300", "EGP 80", "EGP 120")[index]
                            )
                        }
                    }
                }
            }
        }
        
        item {
            // Buy Again Card
            Card(
                onClick = { /* Navigate to buy again */ },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Repeat,
                        contentDescription = "Buy Again",
                        tint = colors.primary,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Buy Again",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = colors.foreground
                        )
                        Text(
                            text = "Reorder your favorite items",
                            fontSize = 14.sp,
                            color = colors.mutedForeground
                        )
                    }
                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = "Go",
                        tint = Color.Gray,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
        
        item {
            // Your Lists Card
            Card(
                onClick = { /* Navigate to your lists */ },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.List,
                        contentDescription = "Your Lists",
                        tint = colors.primary,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Your Lists",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = colors.foreground
                        )
                        Text(
                            text = "Manage your saved lists",
                            fontSize = 14.sp,
                            color = colors.mutedForeground
                        )
                    }
                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = "Go",
                        tint = Color.Gray,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
        
        item {
            // Keep Shopping Card
            Card(
                onClick = { /* Navigate to keep shopping */ },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.ShoppingCart,
                        contentDescription = "Keep Shopping",
                        tint = colors.primary,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Keep Shopping",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = colors.foreground
                        )
                        Text(
                            text = "Continue from your search history",
                            fontSize = 14.sp,
                            color = colors.mutedForeground
                        )
                    }
                    Icon(
                        imageVector = Icons.Default.ChevronRight,
                        contentDescription = "Go",
                        tint = Color.Gray,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }
        }
        
        item {
            // Reviews Card - Amazon Style
            Card(
                onClick = { /* Navigate to reviews */ },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp)
                ) {
                    // Header with title and see all
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Your Reviews",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.foreground
                        )
                        Text(
                            text = "See all",
                            fontSize = 14.sp,
                            color = Color.Blue
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(12.dp))
                    
                    // Review cards carousel
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        items(3) { index ->
                            ReviewCard(
                                rating = 5,
                                reviewText = listOf("Great product!", "Excellent quality", "Fast delivery")[index],
                                productName = listOf("Engine Oil", "Brake Pads", "Air Filter")[index]
                            )
                        }
                    }
                }
            }
        }
        
        item {
            // Menu Items
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                        // Saved Addresses
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 12.dp)
                                .clickable { onNavigateToSavedAddresses() },
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.LocationOn,
                                contentDescription = "Saved Addresses",
                                tint = Color.Black,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(16.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Saved Addresses",
                                    fontSize = 16.sp,
                                    color = colors.foreground
                                )
                                Text(
                                    text = "Manage delivery addresses",
                                    fontSize = 14.sp,
                                    color = colors.mutedForeground
                                )
                            }
                            Icon(
                                imageVector = Icons.Default.ChevronRight,
                                contentDescription = "Navigate",
                                tint = Color.Gray,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        
                        Divider(color = Color.LightGray, thickness = 1.dp)
                        
                    // Get Help
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 12.dp)
                                .clickable { onNavigateToHelp() },
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.HeadsetMic,
                                contentDescription = "Get Help",
                            tint = Color.Black,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                            Column(modifier = Modifier.weight(1f)) {
                        Text(
                                    text = "Get Help",
                            fontSize = 16.sp,
                            color = colors.foreground
                                )
                                Text(
                                    text = "Support and assistance",
                                    fontSize = 14.sp,
                                    color = colors.mutedForeground
                                )
                            }
                            Icon(
                                imageVector = Icons.Default.ChevronRight,
                                contentDescription = "Navigate",
                                tint = Color.Gray,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        
                        Divider(color = Color.LightGray, thickness = 1.dp)
                    
                    // About
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 12.dp)
                                .clickable { onNavigateToAbout() },
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.Info,
                                contentDescription = "About",
                                tint = Color.Black,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(16.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "About",
                                    fontSize = 16.sp,
                                    color = colors.foreground
                                )
                                Text(
                                    text = "App information and version",
                                    fontSize = 14.sp,
                                    color = colors.mutedForeground
                                )
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
            }
            
            item {
                // Theme and Language Toggle Buttons
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        // Theme Toggle
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Palette,
                                contentDescription = "Theme",
                                tint = Color.Black,
                                modifier = Modifier.size(24.dp)
                            )
                            Spacer(modifier = Modifier.width(16.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Dark Mode",
                                    fontSize = 16.sp,
                                    color = colors.foreground
                                )
                                Text(
                                    text = "Toggle dark/light theme",
                                    fontSize = 14.sp,
                                    color = colors.mutedForeground
                                )
                            }
                        Switch(
                            checked = isDarkTheme,
                            onCheckedChange = { newValue ->
                                isDarkTheme = newValue
                                ThemeManager.setThemeMode(if (newValue) ThemeManager.THEME_DARK else ThemeManager.THEME_LIGHT)
                            },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.White,
                                    checkedTrackColor = ClutchRed,
                                    uncheckedThumbColor = Color.White,
                                    uncheckedTrackColor = Color.Gray
                                )
                            )
                        }
                        
                        Divider(color = Color.LightGray, thickness = 1.dp)
                        
                        // Language Toggle
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Language,
                                contentDescription = "Language",
                            tint = Color.Black,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                            Column(modifier = Modifier.weight(1f)) {
                        Text(
                                    text = "Language",
                            fontSize = 16.sp,
                            color = colors.foreground
                                )
                                Text(
                                    text = "English / العربية",
                                    fontSize = 14.sp,
                                    color = colors.mutedForeground
                                )
                            }
                        Switch(
                            checked = currentLang == LanguageManager.LANG_ARABIC,
                            onCheckedChange = { newValue ->
                                val newLang = if (newValue) LanguageManager.LANG_ARABIC else LanguageManager.LANG_ENGLISH
                                currentLang = newLang
                                LanguageManager.setLanguage(newLang)
                            },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.White,
                                    checkedTrackColor = ClutchRed,
                                    uncheckedThumbColor = Color.White,
                                    uncheckedTrackColor = Color.Gray
                                )
                        )
                    }
                }
            }
        }
            
            item {
                // Sign Out Button
                Card(
                    onClick = onSignOut,
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(12.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.ExitToApp,
                            contentDescription = "Sign Out",
                            tint = Color.Red,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(16.dp))
                        Text(
                            text = "Sign Out",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color.Red
                        )
                }
            }
        }
        
        item {
            Spacer(modifier = Modifier.height(100.dp)) // Space for bottom navigation
        }
        }
    }
}

// Helper components for Amazon-style cards
@Composable
private fun OrderCard(
    orderNumber: String,
    status: String,
    items: Int
) {
    Card(
        modifier = Modifier
            .width(140.dp)
            .height(100.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = orderNumber,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
            Text(
                text = status,
                fontSize = 10.sp,
                color = Color.Gray
            )
            if (items > 1) {
                Text(
                    text = "+${items - 1} more",
                    fontSize = 10.sp,
                    color = Color.Gray
                )
            }
        }
    }
}

@Composable
private fun ProductCard(
    productName: String,
    price: String
) {
    Card(
        modifier = Modifier
            .width(100.dp)
            .height(120.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Product image placeholder
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .background(Color.Gray.copy(alpha = 0.3f), RoundedCornerShape(4.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.ShoppingCart,
                    contentDescription = productName,
                    tint = Color.Gray,
                    modifier = Modifier.size(24.dp)
                )
            }
            
            Text(
                text = productName,
                fontSize = 10.sp,
                fontWeight = FontWeight.Medium,
                color = Color.Black,
                textAlign = TextAlign.Center,
                maxLines = 2
            )
            
            Text(
                text = price,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Color.Black
            )
        }
    }
}

@Composable
private fun ReviewCard(
    rating: Int,
    reviewText: String,
    productName: String
) {
    Card(
        modifier = Modifier
            .width(120.dp)
            .height(100.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(8.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // Stars
            Row {
                repeat(rating) {
                    Icon(
                        imageVector = Icons.Default.Star,
                        contentDescription = "Star",
                        tint = Color.Yellow,
                        modifier = Modifier.size(12.dp)
                    )
                }
            }
            
            Text(
                text = reviewText,
                fontSize = 10.sp,
                color = Color.Black,
                maxLines = 2
            )
            
            Text(
                text = productName,
                fontSize = 8.sp,
                color = Color.Gray
            )
        }
    }
}
