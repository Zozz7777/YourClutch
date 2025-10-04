package com.clutch.app.ui.screens.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.R
import com.clutch.app.ui.theme.*
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import com.clutch.app.ui.components.CompactLoadingIndicator
import com.clutch.app.utils.TranslationManager
import com.clutch.app.utils.ThemeManager
import com.clutch.app.ui.components.ErrorDialog
import com.clutch.app.data.repository.ClutchRepository
import com.clutch.app.data.model.LoginRequest
import com.clutch.app.utils.SessionManager
import dagger.hilt.android.lifecycle.HiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onNavigateToSignup: () -> Unit,
    onNavigateToForgotPassword: () -> Unit,
    viewModel: LoginViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    
    // Theme management
    val isDarkTheme = ThemeManager.isDarkTheme(context)
    val colors = if (isDarkTheme) ClutchDarkColors else ClutchColors
    
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }
    var showErrorDialog by remember { mutableStateOf(false) }
    
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    // Handle login success
    LaunchedEffect(uiState.loginSuccess) {
        if (uiState.loginSuccess) {
            onLoginSuccess()
        }
    }
    
    // Handle error messages
    LaunchedEffect(uiState.errorMessage) {
        if (uiState.errorMessage.isNotEmpty()) {
            showErrorDialog = true
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Logo Section
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Image(
                    painter = painterResource(id = R.drawable.clutch_logo_red),
                    contentDescription = stringResource(R.string.clutch_logo),
                    modifier = Modifier.size(80.dp)
                )
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = TranslationManager.getString(context, R.string.welcome_back),
                    fontSize = 28.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.foreground
                )
                Text(
                    text = TranslationManager.getString(context, R.string.sign_in_to_continue),
                    fontSize = 16.sp,
                    color = colors.mutedForeground,
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(48.dp))

            // Login Form
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = colors.card),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Email/Phone Field
                    OutlinedTextField(
                        value = email,
                        onValueChange = { email = it },
                        label = { Text(TranslationManager.getString(context, R.string.email_phone)) },
                        placeholder = { Text(stringResource(R.string.email_phone)) },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = stringResource(R.string.email_phone)
                            )
                        },
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Text, // Changed from Email to Text to allow phone numbers
                            imeAction = ImeAction.Next
                        ),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = colors.primary,
                            unfocusedBorderColor = colors.border,
                            focusedLabelColor = colors.primary,
                            unfocusedLabelColor = colors.mutedForeground,
                            focusedTextColor = colors.foreground,
                            unfocusedTextColor = colors.mutedForeground,
                            focusedLeadingIconColor = colors.primary,
                            unfocusedLeadingIconColor = colors.mutedForeground,
                            focusedTrailingIconColor = colors.primary,
                            unfocusedTrailingIconColor = colors.mutedForeground
                        )
                    )

                    // Password Field
                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        label = { Text(TranslationManager.getString(context, R.string.password)) },
                        leadingIcon = {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = stringResource(R.string.password)
                            )
                        },
                        trailingIcon = {
                            IconButton(onClick = { passwordVisible = !passwordVisible }) {
                                Icon(
                                    imageVector = if (passwordVisible) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                    contentDescription = if (passwordVisible) stringResource(R.string.hide_password) else stringResource(R.string.show_password)
                                )
                            }
                        },
                        visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Password,
                            imeAction = ImeAction.Done
                        ),
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = colors.primary,
                            unfocusedBorderColor = colors.border,
                            focusedLabelColor = colors.primary,
                            unfocusedLabelColor = colors.mutedForeground,
                            focusedTextColor = colors.foreground,
                            unfocusedTextColor = colors.mutedForeground,
                            focusedLeadingIconColor = colors.primary,
                            unfocusedLeadingIconColor = colors.mutedForeground,
                            focusedTrailingIconColor = colors.primary,
                            unfocusedTrailingIconColor = colors.mutedForeground
                        )
                    )


                    // Forgot Password
                    Text(
                        text = TranslationManager.getString(context, R.string.forgot_password),
                        color = ClutchRed,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier
                            .align(Alignment.End)
                            .clickable { onNavigateToForgotPassword() }
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Login Button
                    Button(
                        onClick = {
                            viewModel.login(email, password)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = ClutchRed),
                        shape = RoundedCornerShape(12.dp),
                        enabled = !uiState.isLoading
                    ) {
                        if (uiState.isLoading) {
                            CompactLoadingIndicator()
                        } else {
                            Text(
                                text = TranslationManager.getString(context, R.string.login),
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = colors.cardForeground
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Social Login
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = TranslationManager.getString(context, R.string.or_continue_with),
                    color = colors.mutedForeground,
                    fontSize = 14.sp
                )

                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Google Login
                    OutlinedButton(
                        onClick = { 
                            // Google login implementation
                            viewModel.loginWithGoogle()
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = colors.foreground
                        )
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_google_logo),
                            contentDescription = stringResource(R.string.google),
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(TranslationManager.getString(context, R.string.login_with_google), fontSize = 14.sp)
                    }

                    // Facebook Login
                    OutlinedButton(
                        onClick = { 
                            // Facebook login implementation
                            viewModel.loginWithFacebook()
                        },
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = colors.foreground
                        )
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_facebook_logo),
                            contentDescription = stringResource(R.string.facebook),
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(TranslationManager.getString(context, R.string.login_with_facebook), fontSize = 14.sp)
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Sign Up Link
            Row(
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = TranslationManager.getString(context, R.string.already_have_account),
                    color = colors.mutedForeground,
                    fontSize = 14.sp
                )
                Text(
                    text = TranslationManager.getString(context, R.string.signup),
                    color = ClutchRed,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.clickable { onNavigateToSignup() }
                )
            }
        }
    }
    
    // Error Dialog
    if (showErrorDialog && uiState.errorMessage.isNotEmpty()) {
        ErrorDialog(
            title = TranslationManager.getString(context, R.string.login_failed),
            message = uiState.errorMessage,
            onDismiss = { 
                showErrorDialog = false
                viewModel.clearError()
            },
            onRetry = {
                viewModel.login(email, password)
            }
        )
    }
}
