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
import dagger.hilt.android.AndroidEntryPoint

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
    var currentScreen by remember { mutableStateOf("auth") }
    
    when (currentScreen) {
        "auth" -> AuthScreen(
            onSignUpClick = { currentScreen = "signup" },
            onRequestToJoinClick = { currentScreen = "request" }
        )
        "signup" -> SignUpForm(
            onAuthenticated = { currentScreen = "dashboard" }
        )
        "request" -> RequestToJoinForm(
            onAuthenticated = { currentScreen = "dashboard" }
        )
        "dashboard" -> DashboardScreen()
    }
}

@Composable
fun AuthScreen(
    onSignUpClick: () -> Unit,
    onRequestToJoinClick: () -> Unit
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
            // Background Image
            Image(
                painter = painterResource(id = R.drawable.clutch_logo),
                contentDescription = null,
                modifier = Modifier
                    .fillMaxSize()
                    .graphicsLayer { alpha = 0.1f },
                contentScale = ContentScale.Crop
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
                        containerColor = if (isRTL) DarkPrimary else LightPrimary
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text(
                        text = if (isRTL) "إنشاء حساب" else "Sign Up",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isRTL) DarkPrimaryForeground else LightPrimaryForeground
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
            }
        }
    }
}

@Composable
fun SignUpForm(onAuthenticated: () -> Unit) {
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
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = if (isRTL) "إنشاء حساب للشريك الموجود" else "Create account for existing partner",
                fontSize = 16.sp,
                color = LightMutedForeground,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(bottom = 16.dp)
            )

            OutlinedTextField(
                value = partnerId,
                onValueChange = { partnerId = it },
                label = { Text(if (isRTL) "معرف الشريك" else "Partner ID") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder
                )
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text(if (isRTL) "البريد الإلكتروني" else "Email") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder
                ),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Email,
                    imeAction = ImeAction.Next
                )
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text(if (isRTL) "كلمة المرور" else "Password") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder
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
                }
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
                colors = ButtonDefaults.buttonColors(containerColor = LightPrimary),
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
            
        // Show error message if any
        val currentAuthState = authState
        when (currentAuthState) {
            is AuthState.Error -> {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = currentAuthState.message,
                    color = Color.Red,
                    fontSize = 14.sp,
                    textAlign = TextAlign.Center
                )
            }
            else -> {}
        }
    }
}

@Composable
fun RequestToJoinForm(onAuthenticated: () -> Unit) {
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
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            OutlinedTextField(
                value = businessName,
                onValueChange = { businessName = it },
                label = { Text(if (isRTL) "اسم المتجر" else "Business Name") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder
                )
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = ownerName,
                onValueChange = { ownerName = it },
                label = { Text(if (isRTL) "اسم المالك" else "Owner Name") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder
                )
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = emailOrPhone,
                onValueChange = { emailOrPhone = it },
                label = { Text(if (isRTL) "البريد الإلكتروني أو الهاتف" else "Email or Phone") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder
                )
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = businessAddress,
                onValueChange = { businessAddress = it },
                label = { Text(if (isRTL) "عنوان المتجر" else "Business Address") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder
                )
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            OutlinedTextField(
                value = partnerType,
                onValueChange = { partnerType = it },
                label = { Text(if (isRTL) "نوع الشريك" else "Partner Type") },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = LightPrimary,
                    unfocusedBorderColor = LightBorder
                )
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
                colors = ButtonDefaults.buttonColors(containerColor = LightPrimary),
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
            
        // Show error message if any
        val currentAuthState = authState
        when (currentAuthState) {
            is AuthState.Error -> {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = currentAuthState.message,
                    color = Color.Red,
                    fontSize = 14.sp,
                    textAlign = TextAlign.Center
                )
            }
            else -> {}
        }
    }
}

@Composable
fun DashboardScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Welcome to Clutch Partners!",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = LightPrimary
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = "Your account has been successfully created.",
            fontSize = 16.sp,
            color = LightMutedForeground,
            textAlign = TextAlign.Center
        )
    }
}