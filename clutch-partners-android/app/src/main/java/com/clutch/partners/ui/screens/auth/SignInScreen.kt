package com.clutch.partners.ui.screens.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDirection
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.clutch.partners.ClutchPartnersTheme
import com.clutch.partners.R
import com.clutch.partners.navigation.Screen
import com.clutch.partners.ui.components.ErrorHandler
import com.clutch.partners.utils.LanguageManager
import com.clutch.partners.viewmodel.AuthViewModel

@Composable
fun SignInScreen(
    navController: NavController,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val currentLanguage = LanguageManager.getCurrentLanguage(context)
    val layoutDirection = LocalLayoutDirection.current
    val isRTL = layoutDirection == LayoutDirection.Rtl
    val keyboardController = LocalSoftwareKeyboardController.current
    
    var emailOrPhone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var showErrorDialog by remember { mutableStateOf(false) }
    
    ClutchPartnersTheme {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(40.dp))
            
            // Logo
            Image(
                painter = painterResource(id = R.drawable.partners_logo_white),
                contentDescription = "Partners Logo",
                modifier = Modifier.size(100.dp)
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Title
            Text(
                text = if (currentLanguage == "ar") "تسجيل الدخول" else "Sign In",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = if (currentLanguage == "ar") "أدخل بياناتك للدخول إلى حسابك" else "Enter your credentials to access your account",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(40.dp))
            
            // Form
            Column(
                verticalArrangement = Arrangement.spacedBy(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                      // Email/Phone Field
                      OutlinedTextField(
                          value = emailOrPhone,
                          onValueChange = { emailOrPhone = it },
                          label = {
                              Text(
                                  text = if (currentLanguage == "ar") "البريد الإلكتروني أو رقم الهاتف" else "Email or Phone",
                                  style = androidx.compose.ui.text.TextStyle(
                                      textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                                  )
                              )
                          },
                          leadingIcon = {
                              Icon(Icons.Default.Email, contentDescription = null)
                          },
                          modifier = Modifier.fillMaxWidth(),
                          singleLine = true,
                          keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                              keyboardType = KeyboardType.Email,
                              imeAction = ImeAction.Next
                          ),
                          textStyle = androidx.compose.ui.text.TextStyle(
                              textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                          )
                      )
                
                // Password Field
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    label = {
                        Text(
                            text = if (currentLanguage == "ar") "كلمة المرور" else "Password",
                            style = androidx.compose.ui.text.TextStyle(
                                textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                            )
                        )
                    },
                    leadingIcon = {
                        Icon(Icons.Default.Lock, contentDescription = null)
                    },
                    trailingIcon = {
                        IconButton(onClick = { passwordVisible = !passwordVisible }) {
                            Icon(
                                if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = if (passwordVisible) "Hide password" else "Show password"
                            )
                        }
                    },
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                        keyboardType = KeyboardType.Password,
                        imeAction = ImeAction.Done
                    ),
                    keyboardActions = androidx.compose.foundation.text.KeyboardActions(
                        onDone = {
                            // Hide keyboard
                            keyboardController?.hide()
                            
                            // Clear previous errors
                            errorMessage = ""
                            
                            // Validate inputs first
                            if (emailOrPhone.isEmpty()) {
                                errorMessage = if (currentLanguage == "ar") "البريد الإلكتروني أو رقم الهاتف مطلوب" else "Email or phone is required"
                                showErrorDialog = true
                                return@KeyboardActions
                            }
                            if (password.isEmpty()) {
                                errorMessage = if (currentLanguage == "ar") "كلمة المرور مطلوبة" else "Password is required"
                                showErrorDialog = true
                                return@KeyboardActions
                            }
                            if (password.length < 6) {
                                errorMessage = if (currentLanguage == "ar") "كلمة المرور يجب أن تكون 6 أحرف على الأقل" else "Password must be at least 6 characters"
                                showErrorDialog = true
                                return@KeyboardActions
                            }
                            
                            println("🔐 SignInScreen: Starting authentication for email: $emailOrPhone")
                            isLoading = true
                            
                            // Direct authentication without connection test
                            viewModel.signIn(emailOrPhone, password) { success ->
                                println("🔐 SignInScreen: Authentication result: $success")
                                isLoading = false
                                if (success) {
                                    println("🔐 SignInScreen: Navigating to main screen")
                                    navController.navigate(Screen.Main.route)
                                } else {
                                    println("🔐 SignInScreen: Authentication failed, showing error")
                                    errorMessage = viewModel.uiState.value.error ?: if (currentLanguage == "ar") "فشل في تسجيل الدخول. تحقق من بياناتك" else "Login failed. Please check your credentials"
                                    showErrorDialog = true
                                }
                            }
                        }
                    ),
                    textStyle = androidx.compose.ui.text.TextStyle(
                        textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                    )
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                // Forgot Password Link
                TextButton(
                    onClick = { navController.navigate(Screen.ForgotPassword.route) }
                ) {
                    Text(
                        text = if (currentLanguage == "ar") "نسيت كلمة المرور؟" else "Forgot Password?",
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Sign In Button
                Button(
                    onClick = {
                        // Hide keyboard
                        keyboardController?.hide()
                        
                        // Clear previous errors
                        errorMessage = ""
                        
                        // Validate inputs first
                        if (emailOrPhone.isEmpty()) {
                            errorMessage = if (currentLanguage == "ar") "البريد الإلكتروني أو رقم الهاتف مطلوب" else "Email or phone is required"
                            showErrorDialog = true
                            return@Button
                        }
                        if (password.isEmpty()) {
                            errorMessage = if (currentLanguage == "ar") "كلمة المرور مطلوبة" else "Password is required"
                            showErrorDialog = true
                            return@Button
                        }
                        if (password.length < 6) {
                            errorMessage = if (currentLanguage == "ar") "كلمة المرور يجب أن تكون 6 أحرف على الأقل" else "Password must be at least 6 characters"
                            showErrorDialog = true
                            return@Button
                        }
                        
                        println("🔐 SignInScreen: Button click - Starting authentication for email: $emailOrPhone")
                        isLoading = true
                        
                        // Direct authentication without connection test
                        viewModel.signIn(emailOrPhone, password) { success ->
                            println("🔐 SignInScreen: Button click - Authentication result: $success")
                            isLoading = false
                            if (success) {
                                println("🔐 SignInScreen: Button click - Navigating to main screen")
                                navController.navigate(Screen.Main.route)
                            } else {
                                println("🔐 SignInScreen: Button click - Authentication failed, showing error")
                                errorMessage = viewModel.uiState.value.error ?: if (currentLanguage == "ar") "فشل في تسجيل الدخول. تحقق من بياناتك" else "Login failed. Please check your credentials"
                                showErrorDialog = true
                            }
                        }
                    },
                    enabled = emailOrPhone.isNotEmpty() && password.isNotEmpty() && !isLoading,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.primary
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            color = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    } else {
                        Text(
                            text = if (currentLanguage == "ar") "تسجيل الدخول" else "Sign In",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Sign Up Link
                Row(
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (currentLanguage == "ar") "ليس لديك حساب؟" else "Don't have an account?",
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
                    )
                    TextButton(
                        onClick = { navController.navigate(Screen.SignUp.route) }
                    ) {
                        Text(
                            text = if (currentLanguage == "ar") "إنشاء حساب" else "Sign Up",
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.weight(1f))
        }
        
        // Comprehensive Error Handler
        ErrorHandler(
            error = if (showErrorDialog) errorMessage else null,
            currentLanguage = currentLanguage,
            onDismiss = { showErrorDialog = false }
        )
    }
}
