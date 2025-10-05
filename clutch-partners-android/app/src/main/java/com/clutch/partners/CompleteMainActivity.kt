package com.clutch.partners

import android.content.Context
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.runtime.CompositionLocalProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.compose.foundation.Image
import com.clutch.partners.ui.theme.ClutchPartnersTheme
import com.clutch.partners.ui.theme.*
import com.clutch.partners.ui.viewmodel.AuthViewModel
import com.clutch.partners.ui.viewmodel.AuthState
import com.clutch.partners.utils.LanguageManager
import com.clutch.partners.ui.screens.*
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.delay

@AndroidEntryPoint
class CompleteMainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ClutchPartnersTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainScreen()
                }
            }
        }
    }
}

@Composable
fun MainScreen() {
    var currentScreen by remember { mutableStateOf("splash") }
    var selectedPartnerType by remember { mutableStateOf<com.clutch.partners.ui.screens.PartnerType?>(null) }
    
    fun navigateBack() {
        when (currentScreen) {
            "signup", "request", "signin" -> currentScreen = "auth"
            "auth" -> currentScreen = "partnerType"
            "partnerType" -> currentScreen = "onboarding"
            "onboarding" -> currentScreen = "splash"
            "kyc" -> currentScreen = "auth"
            else -> {}
        }
    }
    
    when (currentScreen) {
        "splash" -> SplashScreen(
            onSplashComplete = { currentScreen = "onboarding" }
        )
        "onboarding" -> OnboardingScreen(
            onGetStarted = { currentScreen = "partnerType" }
        )
        "partnerType" -> PartnerTypeSelectorScreen(
            onPartnerTypeSelected = { partnerType ->
                selectedPartnerType = partnerType
                currentScreen = "auth"
            }
        )
        "auth" -> AuthScreen(
            onSignUpClick = { currentScreen = "signup" },
            onRequestToJoinClick = { currentScreen = "request" },
            onSignInClick = { currentScreen = "signin" }
        )
        "signup" -> SignUpForm(
            onAuthenticated = { currentScreen = "kyc" },
            onBackClick = { navigateBack() }
        )
        "request" -> RequestToJoinForm(
            onAuthenticated = { currentScreen = "kyc" },
            onBackClick = { navigateBack() }
        )
        "signin" -> SignInForm(
            onAuthenticated = { currentScreen = "main" },
            onBackClick = { navigateBack() }
        )
        "kyc" -> KYCVerificationScreen(
            onVerificationComplete = { currentScreen = "main" }
        )
        "main" -> MainAppScreen()
    }
}

@Composable
fun SplashScreen(onSplashComplete: () -> Unit) {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    // Animation for logo
    val infiniteTransition = rememberInfiniteTransition(label = "splash")
    val scale by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1.2f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = EaseInOut),
            repeatMode = RepeatMode.Reverse
        ),
        label = "scale"
    )
    
    val alpha by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, easing = EaseInOut),
            repeatMode = RepeatMode.Reverse
        ),
        label = "alpha"
    )
    
    LaunchedEffect(Unit) {
        delay(3000) // Show splash for 3 seconds
        onSplashComplete()
    }
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(SplashBackground),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // Animated Logo
                Image(
                    painter = painterResource(id = R.drawable.clutch_logo),
                    contentDescription = "Clutch Logo",
                    modifier = Modifier
                        .size(150.dp)
                        .graphicsLayer {
                            scaleX = scale
                            scaleY = scale
                            this.alpha = alpha
                        }
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                Text(
                    text = if (isRTL) "شركاء كلاتش" else "Clutch Partners",
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    textAlign = TextAlign.Center
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = if (isRTL) "منصة إدارة الشركاء" else "Partner Management Platform",
                    fontSize = 16.sp,
                    color = Color.White.copy(alpha = 0.8f),
                    textAlign = TextAlign.Center
                )
                
                Spacer(modifier = Modifier.height(32.dp))
                
                // Loading indicator
                CircularProgressIndicator(
                    color = Color.White,
                    modifier = Modifier.size(32.dp),
                    strokeWidth = 3.dp
                )
            }
        }
    }
}

@Composable
fun OnboardingScreen(onGetStarted: () -> Unit) {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    var currentPage by remember { mutableStateOf(0) }
    
    val pages = listOf(
        OnboardingPage(
            title = if (isRTL) "إدارة متجرك من هاتفك" else "Manage Your Store from Your Phone",
            description = if (isRTL) "يمكنك الآن إدارة جميع عمليات متجرك بسهولة من خلال تطبيق شركاء كلاتش" else "You can now manage all your store operations easily through the Clutch Partners app",
            icon = Icons.Filled.Store,
            color = PartnersBlue
        ),
        OnboardingPage(
            title = if (isRTL) "استقبال طلبات كلاتش" else "Receive Clutch Orders",
            description = if (isRTL) "احصل على طلبات العملاء ومواعيد الصيانة مباشرة من منصة كلاتش" else "Get customer orders and maintenance appointments directly from the Clutch platform",
            icon = Icons.Filled.ShoppingCart,
            color = Orange
        ),
        OnboardingPage(
            title = if (isRTL) "تتبع الأرباح والمدفوعات" else "Track Earnings & Payments",
            description = if (isRTL) "راقب إيراداتك اليومية والأسبوعية ومواعيد استلام المدفوعات" else "Monitor your daily and weekly revenue and payment collection schedules",
            icon = Icons.Filled.TrendingUp,
            color = LightSuccess
        )
    )
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
        ) {
            Column(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Skip button
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onGetStarted) {
                        Text(
                            text = if (isRTL) "تخطي" else "Skip",
                            color = if (isRTL) DarkMutedForeground else LightMutedForeground
                        )
                    }
                }
                
                Spacer(modifier = Modifier.weight(1f))
                
                // Page content
                val currentPageData = pages[currentPage]
                
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(32.dp)
                ) {
                    // Icon
                    Box(
                        modifier = Modifier
                            .size(120.dp)
                            .background(
                                currentPageData.color.copy(alpha = 0.1f),
                                CircleShape
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = currentPageData.icon,
                            contentDescription = null,
                            modifier = Modifier.size(60.dp),
                            tint = currentPageData.color
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(32.dp))
                    
                    Text(
                        text = currentPageData.title,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isRTL) DarkForeground else LightForeground,
                        textAlign = TextAlign.Center
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Text(
                        text = currentPageData.description,
                        fontSize = 16.sp,
                        color = if (isRTL) DarkMutedForeground else LightMutedForeground,
                        textAlign = TextAlign.Center,
                        lineHeight = 24.sp
                    )
                }
                
                Spacer(modifier = Modifier.weight(1f))
                
                // Page indicators
                Row(
                    horizontalArrangement = Arrangement.Center,
                    modifier = Modifier.padding(16.dp)
                ) {
                    pages.forEachIndexed { index, _ ->
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .background(
                                    if (index == currentPage) currentPageData.color else Color.Gray.copy(alpha = 0.3f),
                                    CircleShape
                                )
                        )
                        if (index < pages.size - 1) {
                            Spacer(modifier = Modifier.width(8.dp))
                        }
                    }
                }
                
                // Navigation buttons
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(32.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    if (currentPage > 0) {
                        OutlinedButton(
                            onClick = { currentPage-- },
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = if (isRTL) DarkForeground else LightForeground
                            )
                        ) {
                            Text(if (isRTL) "السابق" else "Previous")
                        }
                    } else {
                        Spacer(modifier = Modifier.width(100.dp))
                    }
                    
                    Button(
                        onClick = {
                            if (currentPage < pages.size - 1) {
                                currentPage++
                            } else {
                                onGetStarted()
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = currentPageData.color
                        )
                    ) {
                        Text(
                            if (currentPage < pages.size - 1) {
                                if (isRTL) "التالي" else "Next"
                            } else {
                                if (isRTL) "ابدأ الآن" else "Get Started"
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun AuthScreen(
    onSignUpClick: () -> Unit,
    onRequestToJoinClick: () -> Unit,
    onSignInClick: () -> Unit
) {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    if (isRTL) DarkBackground else LightBackground
                )
        ) {
            // Background gradient
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(
                        brush = androidx.compose.ui.graphics.Brush.verticalGradient(
                            colors = listOf(
                                if (isRTL) DarkBackground else LightBackground,
                                if (isRTL) DarkCard else LightCard
                            )
                        )
                    )
            )
            
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                // Logo
                Image(
                    painter = painterResource(id = R.drawable.clutch_logo),
                    contentDescription = "Clutch Logo",
                    modifier = Modifier.size(120.dp)
                )
                
                Spacer(modifier = Modifier.height(32.dp))
                
                Text(
                    text = if (isRTL) "مرحباً بك في كلتش" else "Welcome to Clutch",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isRTL) DarkForeground else LightForeground,
                    textAlign = TextAlign.Center
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Text(
                    text = if (isRTL) "منصة إدارة الشركاء" else "Partner Management Platform",
                    fontSize = 16.sp,
                    color = if (isRTL) DarkMutedForeground else LightMutedForeground,
                    textAlign = TextAlign.Center
                )
                
                Spacer(modifier = Modifier.height(48.dp))
                
                // Sign Up Button
                Button(
                    onClick = onSignUpClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = PartnersBlue
                    ),
                    shape = RoundedCornerShape(12.dp),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
                ) {
                    Text(
                        text = if (isRTL) "إنشاء حساب" else "Sign Up",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Request to Join Button
                OutlinedButton(
                    onClick = onRequestToJoinClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = if (isRTL) DarkForeground else LightForeground
                    ),
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        brush = androidx.compose.ui.graphics.SolidColor(
                            if (isRTL) DarkBorder else LightBorder
                        )
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = if (isRTL) "طلب الانضمام" else "Request to Join",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                
                Spacer(modifier = Modifier.height(32.dp))
                
                // Additional info
                Text(
                    text = if (isRTL) "هل لديك حساب بالفعل؟" else "Already have an account?",
                    fontSize = 14.sp,
                    color = if (isRTL) DarkMutedForeground else LightMutedForeground,
                    textAlign = TextAlign.Center
                )
                
                TextButton(onClick = onSignInClick) {
                    Text(
                        text = if (isRTL) "تسجيل الدخول" else "Sign In",
                        color = PartnersBlue,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
fun SignUpForm(onAuthenticated: () -> Unit, onBackClick: () -> Unit) {
    var partnerId by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    val authViewModel: AuthViewModel = viewModel()
    val authState by authViewModel.authState.collectAsState()
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBackClick) {
                    Icon(
                        Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = if (isRTL) DarkForeground else LightForeground
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isRTL) "إنشاء حساب" else "Sign Up",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isRTL) DarkForeground else LightForeground
                )
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Form
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = if (isRTL) DarkCard else LightCard
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp)
                ) {
                    Text(
                        text = if (isRTL) "إنشاء حساب للشريك الموجود" else "Create account for existing partner",
                        fontSize = 16.sp,
                        color = if (isRTL) DarkMutedForeground else LightMutedForeground,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    OutlinedTextField(
                        value = partnerId,
                        onValueChange = { partnerId = it },
                        label = { Text(if (isRTL) "معرف الشريك" else "Partner ID") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PartnersBlue,
                            unfocusedBorderColor = if (isRTL) DarkBorder else LightBorder
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text(if (isRTL) "البريد الإلكتروني" else "Email") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PartnersBlue,
                            unfocusedBorderColor = if (isRTL) DarkBorder else LightBorder
                        ),
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Email,
                            imeAction = ImeAction.Next
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text(if (isRTL) "كلمة المرور" else "Password") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PartnersBlue,
                            unfocusedBorderColor = if (isRTL) DarkBorder else LightBorder
                        ),
                        visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Password,
                            imeAction = ImeAction.Done
                        ),
                        trailingIcon = {
                            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                Icon(
                                    imageVector = if (passwordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                                    contentDescription = if (passwordVisible) "Hide password" else "Show password"
                                )
                            }
                        },
                        shape = RoundedCornerShape(12.dp)
                    )
                    
                    Spacer(modifier = Modifier.height(32.dp))

                    LaunchedEffect(authState) {
                        when (authState) {
                            is AuthState.Success -> {
                                onAuthenticated()
                            }
                            else -> {}
                        }
                    }

                    Button(
                        onClick = {
                            if (partnerId.isNotEmpty() && email.isNotEmpty() && password.isNotEmpty()) {
                                val businessAddress = com.clutch.partners.data.api.BusinessAddress(
                                    street = "", city = "", state = "", zipCode = ""
                                )
                                authViewModel.signUp(
                                    partnerId,
                                    email,
                                    "", // phone - will be filled from partner record
                                    password,
                                    "", // businessName - will be filled from partner record
                                    "", // ownerName - will be filled from partner record
                                    "", // partnerType - will be filled from partner record
                                    businessAddress
                                )
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PartnersBlue),
                        shape = RoundedCornerShape(12.dp),
                        enabled = authState !is AuthState.Loading
                    ) {
                        if (authState is AuthState.Loading) {
                            CircularProgressIndicator(
                                color = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        } else {
                            Text(
                                text = if (isRTL) "إنشاء حساب" else "Sign Up",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }
            }
            
            // Show error message if any
            val currentAuthState = authState
            when (currentAuthState) {
                is AuthState.Error -> {
                    Spacer(modifier = Modifier.height(16.dp))
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = LightDestructive.copy(alpha = 0.1f)
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = currentAuthState.message,
                            color = LightDestructive,
                            fontSize = 14.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(16.dp)
                        )
                    }
                }
                else -> {}
            }
        }
    }
}

@Composable
fun SignInForm(onAuthenticated: () -> Unit, onBackClick: () -> Unit) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    val authViewModel: AuthViewModel = viewModel()
    val authState by authViewModel.authState.collectAsState()
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBackClick) {
                    Icon(
                        Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = if (isRTL) DarkForeground else LightForeground
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isRTL) "تسجيل الدخول" else "Sign In",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isRTL) DarkForeground else LightForeground
                )
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Form
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = if (isRTL) DarkCard else LightCard
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp)
                ) {
                    Text(
                        text = if (isRTL) "تسجيل الدخول إلى حسابك" else "Sign in to your account",
                        fontSize = 16.sp,
                        color = if (isRTL) DarkMutedForeground else LightMutedForeground,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(24.dp))
                    
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text(if (isRTL) "البريد الإلكتروني" else "Email") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PartnersBlue,
                            unfocusedBorderColor = if (isRTL) DarkBorder else LightBorder
                        ),
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Email,
                            imeAction = ImeAction.Next
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text(if (isRTL) "كلمة المرور" else "Password") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PartnersBlue,
                            unfocusedBorderColor = if (isRTL) DarkBorder else LightBorder
                        ),
                        visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Password,
                            imeAction = ImeAction.Done
                        ),
                        trailingIcon = {
                            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                Icon(
                                    imageVector = if (passwordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                                    contentDescription = if (passwordVisible) "Hide password" else "Show password"
                                )
                            }
                        },
                        shape = RoundedCornerShape(12.dp)
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    // Forgot Password
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.End
                    ) {
                        TextButton(onClick = { /* TODO: Add forgot password */ }) {
                            Text(
                                text = if (isRTL) "نسيت كلمة المرور؟" else "Forgot Password?",
                                color = PartnersBlue,
                                fontSize = 14.sp
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(32.dp))

                    LaunchedEffect(authState) {
                        when (authState) {
                            is AuthState.Success -> {
                                onAuthenticated()
                            }
                            else -> {}
                        }
                    }

                    Button(
                        onClick = {
                            if (email.isNotEmpty() && password.isNotEmpty()) {
                                authViewModel.signIn(email, password)
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PartnersBlue),
                        shape = RoundedCornerShape(12.dp),
                        enabled = authState !is AuthState.Loading
                    ) {
                        if (authState is AuthState.Loading) {
                            CircularProgressIndicator(
                                color = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        } else {
                            Text(
                                text = if (isRTL) "تسجيل الدخول" else "Sign In",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }
            }
            
            // Show error message if any
            val currentAuthState = authState
            when (currentAuthState) {
                is AuthState.Error -> {
                    Spacer(modifier = Modifier.height(16.dp))
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = LightDestructive.copy(alpha = 0.1f)
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = currentAuthState.message,
                            color = LightDestructive,
                            fontSize = 14.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(16.dp)
                        )
                    }
                }
                else -> {}
            }
        }
    }
}

@Composable
fun RequestToJoinForm(onAuthenticated: () -> Unit, onBackClick: () -> Unit) {
    var businessName by remember { mutableStateOf("") }
    var ownerName by remember { mutableStateOf("") }
    var emailOrPhone by remember { mutableStateOf("") }
    var businessAddress by remember { mutableStateOf("") }
    var partnerType by remember { mutableStateOf("") }
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    val authViewModel: AuthViewModel = viewModel()
    val authState by authViewModel.authState.collectAsState()
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBackClick) {
                    Icon(
                        Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = if (isRTL) DarkForeground else LightForeground
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (isRTL) "طلب الانضمام" else "Request to Join",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isRTL) DarkForeground else LightForeground
                )
            }
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Form
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = if (isRTL) DarkCard else LightCard
                ),
                elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp)
                ) {
                    OutlinedTextField(
                        value = businessName,
                        onValueChange = { businessName = it },
                        label = { Text(if (isRTL) "اسم المتجر" else "Business Name") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PartnersBlue,
                            unfocusedBorderColor = if (isRTL) DarkBorder else LightBorder
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    OutlinedTextField(
                        value = ownerName,
                        onValueChange = { ownerName = it },
                        label = { Text(if (isRTL) "اسم المالك" else "Owner Name") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PartnersBlue,
                            unfocusedBorderColor = if (isRTL) DarkBorder else LightBorder
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    OutlinedTextField(
                        value = emailOrPhone,
                        onValueChange = { emailOrPhone = it },
                        label = { Text(if (isRTL) "البريد الإلكتروني أو الهاتف" else "Email or Phone") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PartnersBlue,
                            unfocusedBorderColor = if (isRTL) DarkBorder else LightBorder
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    OutlinedTextField(
                        value = businessAddress,
                        onValueChange = { businessAddress = it },
                        label = { Text(if (isRTL) "عنوان المتجر" else "Business Address") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PartnersBlue,
                            unfocusedBorderColor = if (isRTL) DarkBorder else LightBorder
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    OutlinedTextField(
                        value = partnerType,
                        onValueChange = { partnerType = it },
                        label = { Text(if (isRTL) "نوع الشريك" else "Partner Type") },
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PartnersBlue,
                            unfocusedBorderColor = if (isRTL) DarkBorder else LightBorder
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )
                    
                    Spacer(modifier = Modifier.height(32.dp))

                    LaunchedEffect(authState) {
                        when (authState) {
                            is AuthState.Success -> {
                                onAuthenticated()
                            }
                            else -> {}
                        }
                    }

                    Button(
                        onClick = {
                            if (businessName.isNotEmpty() && ownerName.isNotEmpty() && emailOrPhone.isNotEmpty()) {
                                authViewModel.requestToJoin(
                                    businessName,
                                    ownerName,
                                    emailOrPhone, // phone
                                    emailOrPhone, // email
                                    businessAddress,
                                    partnerType
                                )
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PartnersBlue),
                        shape = RoundedCornerShape(12.dp),
                        enabled = authState !is AuthState.Loading
                    ) {
                        if (authState is AuthState.Loading) {
                            CircularProgressIndicator(
                                color = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        } else {
                            Text(
                                text = if (isRTL) "إرسال الطلب" else "Submit Request",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }
            }
            
            // Show error message if any
            val currentAuthState = authState
            when (currentAuthState) {
                is AuthState.Error -> {
                    Spacer(modifier = Modifier.height(16.dp))
                    Card(
                        colors = CardDefaults.cardColors(
                            containerColor = LightDestructive.copy(alpha = 0.1f)
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = currentAuthState.message,
                            color = LightDestructive,
                            fontSize = 14.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(16.dp)
                        )
                    }
                }
                else -> {}
            }
        }
    }
}

@Composable
fun DashboardScreen() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                Icons.Filled.CheckCircle,
                contentDescription = "Success",
                modifier = Modifier.size(80.dp),
                tint = LightSuccess
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            Text(
                text = if (isRTL) "مرحباً بك في كلتش!" else "Welcome to Clutch Partners!",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = if (isRTL) "تم إنشاء حسابك بنجاح." else "Your account has been successfully created.",
                fontSize = 16.sp,
                color = if (isRTL) DarkMutedForeground else LightMutedForeground,
                textAlign = TextAlign.Center
            )
        }
    }
}

data class OnboardingPage(
    val title: String,
    val description: String,
    val icon: ImageVector,
    val color: Color
)

@Composable
fun MainAppScreen() {
    var selectedTab by remember { mutableStateOf(0) }
    
    val tabs = listOf(
        "Home" to Icons.Filled.Home,
        "Dashboard" to Icons.Filled.Analytics,
        "Payments" to Icons.Filled.Payment,
        "Notifications" to Icons.Filled.Notifications,
        "Support" to Icons.Filled.Help,
        "Audit" to Icons.Filled.Security,
        "Warranty" to Icons.Filled.Gavel,
        "Export" to Icons.Filled.Download,
        "Settings" to Icons.Filled.Settings
    )
    
    Scaffold(
        bottomBar = {
            NavigationBar {
                tabs.forEachIndexed { index, (title, icon) ->
                    NavigationBarItem(
                        icon = { Icon(icon, contentDescription = title) },
                        label = { Text(title) },
                        selected = selectedTab == index,
                        onClick = { selectedTab = index }
                    )
                }
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            when (selectedTab) {
                0 -> HomeScreen()
                1 -> BusinessDashboardScreen()
                2 -> PaymentsScreen()
                3 -> NotificationsScreen()
                4 -> SupportScreen()
                5 -> AuditLogScreen()
                6 -> WarrantyDisputesScreen()
                7 -> DataExportScreen()
                8 -> StoreSettingsScreen()
            }
        }
    }
}

@Composable
fun HomeScreen() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = if (isRTL) "الصفحة الرئيسية" else "Home",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
        }
    }
}

@Composable
fun BusinessDashboardScreen() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = if (isRTL) "لوحة التحكم" else "Dashboard",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
        }
    }
}

@Composable
fun PaymentsScreen() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = if (isRTL) "المدفوعات" else "Payments",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
        }
    }
}

@Composable
fun NotificationsScreen() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = if (isRTL) "الإشعارات" else "Notifications",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
        }
    }
}

@Composable
fun SupportScreen() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = if (isRTL) "الدعم" else "Support",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
        }
    }
}

@Composable
fun AuditLogScreen() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = if (isRTL) "سجل التدقيق" else "Audit Log",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
        }
    }
}

@Composable
fun WarrantyDisputesScreen() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = if (isRTL) "الضمان والنزاعات" else "Warranty & Disputes",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
        }
    }
}

@Composable
fun DataExportScreen() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = if (isRTL) "تصدير البيانات" else "Data Export",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
        }
    }
}

@Composable
fun StoreSettingsScreen() {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = if (isRTL) "إعدادات المتجر" else "Store Settings",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground
            )
        }
    }
}