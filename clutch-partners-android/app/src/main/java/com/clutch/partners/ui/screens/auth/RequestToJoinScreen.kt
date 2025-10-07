package com.clutch.partners.ui.screens.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import com.clutch.partners.utils.LanguageManager
import com.clutch.partners.viewmodel.AuthViewModel
import androidx.compose.material3.ExperimentalMaterial3Api

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RequestToJoinScreen(
    navController: NavController,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val currentLanguage = LanguageManager.getCurrentLanguage(context)
    val layoutDirection = LocalLayoutDirection.current
    val isRTL = layoutDirection == LayoutDirection.Rtl
    
    var businessName by remember { mutableStateOf("") }
    var businessType by remember { mutableStateOf("") }
    var contactName by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    
    val businessTypes = if (currentLanguage == "ar") {
        listOf("ورشة إصلاح", "وكالة سيارات", "متجر قطع غيار", "خدمات صيانة", "أخرى")
    } else {
        listOf("Repair Shop", "Car Dealership", "Parts Store", "Maintenance Services", "Other")
    }
    
    ClutchPartnersTheme {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .verticalScroll(rememberScrollState())
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
                text = if (currentLanguage == "ar") "طلب الانضمام" else "Request to Join",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = if (currentLanguage == "ar") "أدخل معلومات عملك للانضمام إلى منصة الشركاء" else "Enter your business information to join the partners platform",
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
                // Business Name Field
                OutlinedTextField(
                    value = businessName,
                    onValueChange = { businessName = it },
                    label = { 
                        Text(
                            text = if (currentLanguage == "ar") "اسم العمل" else "Business Name",
                            style = androidx.compose.ui.text.TextStyle(
                                textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                            )
                        )
                    },
                    leadingIcon = {
                        Icon(Icons.Default.Business, contentDescription = null)
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
                
                // Business Type Dropdown
                var expanded by remember { mutableStateOf(false) }
                ExposedDropdownMenuBox(
                    expanded = expanded,
                    onExpandedChange = { expanded = !expanded },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    OutlinedTextField(
                        value = businessType,
                        onValueChange = { },
                        readOnly = true,
                        label = { 
                            Text(
                                text = if (currentLanguage == "ar") "نوع العمل" else "Business Type",
                                style = androidx.compose.ui.text.TextStyle(
                                    textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                                )
                            )
                        },
                        leadingIcon = {
                            Icon(Icons.Default.Category, contentDescription = null)
                        },
                        trailingIcon = {
                            ExposedDropdownMenuDefaults.TrailingIcon(expanded = expanded)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .menuAnchor(),
                        keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                            keyboardType = KeyboardType.Text,
                            imeAction = ImeAction.Next
                        ),
                        textStyle = androidx.compose.ui.text.TextStyle(
                            textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                        )
                    )
                    ExposedDropdownMenu(
                        expanded = expanded,
                        onDismissRequest = { expanded = false }
                    ) {
                        businessTypes.forEach { type ->
                            DropdownMenuItem(
                                text = { Text(type) },
                                onClick = {
                                    businessType = type
                                    expanded = false
                                }
                            )
                        }
                    }
                }
                
                // Contact Name Field
                OutlinedTextField(
                    value = contactName,
                    onValueChange = { contactName = it },
                    label = { 
                        Text(
                            text = if (currentLanguage == "ar") "اسم جهة الاتصال" else "Contact Name",
                            style = androidx.compose.ui.text.TextStyle(
                                textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                            )
                        )
                    },
                    leadingIcon = {
                        Icon(Icons.Default.Person, contentDescription = null)
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
                
                // Email Field
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    label = { 
                        Text(
                            text = if (currentLanguage == "ar") "البريد الإلكتروني" else "Email",
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
                
                // Phone Field
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { 
                        Text(
                            text = if (currentLanguage == "ar") "رقم الهاتف" else "Phone Number",
                            style = androidx.compose.ui.text.TextStyle(
                                textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                            )
                        )
                    },
                    leadingIcon = {
                        Icon(Icons.Default.Phone, contentDescription = null)
                    },
                    modifier = Modifier.fillMaxWidth(),
                    singleLine = true,
                    keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                        keyboardType = KeyboardType.Phone,
                        imeAction = ImeAction.Next
                    ),
                    textStyle = androidx.compose.ui.text.TextStyle(
                        textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                    )
                )
                
                // Address Field
                OutlinedTextField(
                    value = address,
                    onValueChange = { address = it },
                    label = { 
                        Text(
                            text = if (currentLanguage == "ar") "العنوان" else "Address",
                            style = androidx.compose.ui.text.TextStyle(
                                textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                            )
                        )
                    },
                    leadingIcon = {
                        Icon(Icons.Default.LocationOn, contentDescription = null)
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
                
                // Description Field
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { 
                        Text(
                            text = if (currentLanguage == "ar") "وصف العمل (اختياري)" else "Business Description (Optional)",
                            style = androidx.compose.ui.text.TextStyle(
                                textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                            )
                        )
                    },
                    leadingIcon = {
                        Icon(Icons.Default.Description, contentDescription = null)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp),
                    maxLines = 4,
                    keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                        keyboardType = KeyboardType.Text,
                        imeAction = ImeAction.Done
                    ),
                    keyboardActions = androidx.compose.foundation.text.KeyboardActions(
                        onDone = {
                            if (businessName.isNotEmpty() && businessType.isNotEmpty() && contactName.isNotEmpty() && email.isNotEmpty() && phone.isNotEmpty() && address.isNotEmpty()) {
                                isLoading = true
                                // Connect to backend for request to join
                                viewModel.requestToJoin(businessName, businessType, contactName, email, phone, address, description) { success ->
                                    isLoading = false
                                    if (success) {
                                        navController.navigate(Screen.Main.route)
                                    }
                                }
                            }
                        }
                    ),
                    textStyle = androidx.compose.ui.text.TextStyle(
                        textDirection = if (isRTL) TextDirection.Rtl else TextDirection.Ltr
                    )
                )
                
                Spacer(modifier = Modifier.height(24.dp))
                
                // Submit Button
                Button(
                    onClick = {
                        isLoading = true
                        // TODO: Implement actual request to join logic
                        navController.navigate(Screen.Main.route)
                    },
                    enabled = businessName.isNotEmpty() && businessType.isNotEmpty() && contactName.isNotEmpty() && email.isNotEmpty() && phone.isNotEmpty() && address.isNotEmpty() && !isLoading,
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
                            text = if (currentLanguage == "ar") "إرسال الطلب" else "Submit Request",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Back to Auth Link
                Row(
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = if (currentLanguage == "ar") "لديك حساب بالفعل؟" else "Already have an account?",
                        color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
                    )
                    TextButton(
                        onClick = { navController.navigate(Screen.Auth.route) }
                    ) {
                        Text(
                            text = if (currentLanguage == "ar") "تسجيل الدخول" else "Sign In",
                            color = MaterialTheme.colorScheme.primary,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}
