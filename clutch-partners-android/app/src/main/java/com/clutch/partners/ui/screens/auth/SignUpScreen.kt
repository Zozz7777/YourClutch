package com.clutch.partners.ui.screens.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
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
import kotlinx.coroutines.delay
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.launch

@Composable
fun SignUpScreen(
    navController: NavController,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val currentLanguage = LanguageManager.getCurrentLanguage(context)
    val layoutDirection = LocalLayoutDirection.current
    val isRTL = layoutDirection == LayoutDirection.Rtl
    val keyboardController = LocalSoftwareKeyboardController.current
    
    var partnerId by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var useEmail by remember { mutableStateOf(true) } // Toggle between email and phone
    var passwordVisible by remember { mutableStateOf(false) }
    var confirmPasswordVisible by remember { mutableStateOf(false) }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var showErrorDialog by remember { mutableStateOf(false) }
    var showSuccessDialog by remember { mutableStateOf(false) }
    
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
                text = if (currentLanguage == "ar") "إنشاء حساب" else "Sign Up",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = if (currentLanguage == "ar") "أدخل بياناتك لإنشاء حساب جديد" else "Enter your information to create a new account",
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
                // Partner ID Field
                OutlinedTextField(
                    value = partnerId,
                    onValueChange = { partnerId = it },
                    label = { 
                        Text(
                            text = if (currentLanguage == "ar") "معرف الشريك" else "Partner ID",
                            style = androidx.compose.ui.text.TextStyle(
                                textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                            )
                        )
                    },
                    leadingIcon = {
                        Icon(Icons.Default.Badge, contentDescription = null)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                        keyboardType = KeyboardType.Text,
                        imeAction = ImeAction.Next
                    ),
                    textStyle = androidx.compose.ui.text.TextStyle(
                        textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                    )
                )
                
                // Email/Phone Field
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
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
                        imeAction = ImeAction.Next
                    ),
                    textStyle = androidx.compose.ui.text.TextStyle(
                        textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                    )
                )
                
                // Confirm Password Field
                OutlinedTextField(
                    value = confirmPassword,
                    onValueChange = { confirmPassword = it },
                    label = { 
                        Text(
                            text = if (currentLanguage == "ar") "تأكيد كلمة المرور" else "Confirm Password",
                            style = androidx.compose.ui.text.TextStyle(
                                textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                            )
                        )
                    },
                    leadingIcon = {
                        Icon(Icons.Default.Lock, contentDescription = null)
                    },
                    trailingIcon = {
                        IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                            Icon(
                                if (confirmPasswordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                contentDescription = if (confirmPasswordVisible) "Hide password" else "Show password"
                            )
                        }
                    },
                    visualTransformation = if (confirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
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
                            
                            // Validate all fields
                            if (partnerId.isEmpty()) {
                                errorMessage = if (currentLanguage == "ar") "معرف الشريك مطلوب" else "Partner ID is required"
                                return@KeyboardActions
                            }
                            if (email.isEmpty() && phone.isEmpty()) {
                                errorMessage = if (currentLanguage == "ar") "البريد الإلكتروني أو رقم الهاتف مطلوب" else "Email or phone is required"
                                return@KeyboardActions
                            }
                            if (password.isEmpty()) {
                                errorMessage = if (currentLanguage == "ar") "كلمة المرور مطلوبة" else "Password is required"
                                return@KeyboardActions
                            }
                            if (password.length < 6) {
                                errorMessage = if (currentLanguage == "ar") "كلمة المرور يجب أن تكون 6 أحرف على الأقل" else "Password must be at least 6 characters"
                                return@KeyboardActions
                            }
                            if (confirmPassword.isEmpty()) {
                                errorMessage = if (currentLanguage == "ar") "تأكيد كلمة المرور مطلوب" else "Confirm password is required"
                                return@KeyboardActions
                            }
                            if (password != confirmPassword) {
                                errorMessage = if (currentLanguage == "ar") "كلمات المرور غير متطابقة" else "Passwords do not match"
                                return@KeyboardActions
                            }
                            
                            isLoading = true
                            // Connect to backend for registration
                            viewModel.signUp(partnerId, email, phone, password) { success ->
                                isLoading = false
                                if (success) {
                                    navController.navigate(Screen.Main.route)
                                } else {
                                    errorMessage = if (currentLanguage == "ar") "فشل في التسجيل. تحقق من بياناتك" else "Registration failed. Please check your information"
                                }
                            }
                        }
                    ),
                    textStyle = androidx.compose.ui.text.TextStyle(
                        textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                    )
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Error Message
                if (errorMessage.isNotEmpty()) {
                    Text(
                        text = errorMessage,
                        color = Color.Red,
                        style = androidx.compose.ui.text.TextStyle(
                            textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                        ),
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                }
                
                // Sign Up Button
                Button(
                    onClick = {
                        // Hide keyboard
                        keyboardController?.hide()
                        
                        // Clear previous errors
                        errorMessage = ""
                        
                        // Validate all fields
                        if (partnerId.isEmpty()) {
                            errorMessage = if (currentLanguage == "ar") "معرف الشريك مطلوب" else "Partner ID is required"
                            showErrorDialog = true
                            return@Button
                        }
                        if (email.isEmpty() && phone.isEmpty()) {
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
                        if (confirmPassword.isEmpty()) {
                            errorMessage = if (currentLanguage == "ar") "تأكيد كلمة المرور مطلوب" else "Confirm password is required"
                            showErrorDialog = true
                            return@Button
                        }
                        if (password != confirmPassword) {
                            errorMessage = if (currentLanguage == "ar") "كلمات المرور غير متطابقة" else "Passwords do not match"
                            showErrorDialog = true
                            return@Button
                        }
                        
                        isLoading = true
                        // Connect to backend for registration (streamlined - only essential fields)
                        viewModel.signUp(partnerId, email, phone, password) { success ->
                            isLoading = false
                            if (success) {
                                // Auto-login after successful signup
                                // The user is already logged in via the signup response
                                // Show success message briefly, then navigate to main app
                                showSuccessDialog = true
                                
                                // Navigate to main app after a short delay to show success message
                                kotlinx.coroutines.GlobalScope.launch {
                                    delay(1500)
                                    navController.navigate(Screen.Dashboard.route) {
                                        // Clear the back stack so user can't go back to auth screens
                                        popUpTo(Screen.SignUp.route) { inclusive = true }
                                    }
                                }
                            } else {
                                val error = viewModel.uiState.value.error ?: ""
                                if (error.startsWith("APPROVAL_PENDING:")) {
                                    // Handle approval pending case
                                    errorMessage = error.removePrefix("APPROVAL_PENDING: ")
                                    showErrorDialog = true
                                } else {
                                    errorMessage = error.ifEmpty { if (currentLanguage == "ar") "فشل في التسجيل. تحقق من بياناتك" else "Registration failed. Please check your information" }
                                    showErrorDialog = true
                                }
                            }
                        }
                    },
                    enabled = partnerId.isNotEmpty() && (email.isNotEmpty() || phone.isNotEmpty()) && password.isNotEmpty() && confirmPassword.isNotEmpty() && password == confirmPassword && !isLoading,
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
                            text = if (currentLanguage == "ar") "إنشاء حساب" else "Sign Up",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Sign In Link
                Row(
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (currentLanguage == "ar") "لديك حساب بالفعل؟" else "Already have an account?",
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
                    )
                    TextButton(
                        onClick = { navController.navigate(Screen.SignIn.route) }
                    ) {
                        Text(
                            text = if (currentLanguage == "ar") "تسجيل الدخول" else "Sign In",
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
        
        // Success Dialog
        if (showSuccessDialog) {
            AlertDialog(
                onDismissRequest = { showSuccessDialog = false },
                title = {
                    Text(
                        text = if (currentLanguage == "ar") "تم إنشاء الحساب بنجاح" else "Account Created Successfully",
                        color = MaterialTheme.colorScheme.primary
                    )
                },
                text = {
                    Text(
                        text = if (currentLanguage == "ar") "تم إنشاء حسابك بنجاح. يمكنك الآن تسجيل الدخول." else "Your account has been created successfully. You can now sign in.",
                        color = MaterialTheme.colorScheme.onSurface
                    )
                },
                confirmButton = {
                    TextButton(
                        onClick = { 
                            showSuccessDialog = false
                            navController.navigate(Screen.SignIn.route)
                        }
                    ) {
                        Text(
                            text = if (currentLanguage == "ar") "تسجيل الدخول" else "Sign In",
                            color = MaterialTheme.colorScheme.primary
                        )
                    }
                }
            )
        }
    }
}
