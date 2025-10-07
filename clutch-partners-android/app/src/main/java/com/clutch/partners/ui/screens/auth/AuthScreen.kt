package com.clutch.partners.ui.screens.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.clutch.partners.ClutchPartnersTheme
import com.clutch.partners.R
import com.clutch.partners.navigation.Screen
import com.clutch.partners.utils.LanguageManager
import com.clutch.partners.viewmodel.AuthViewModel

@Composable
fun AuthScreen(
    navController: NavController,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val currentLanguage = LanguageManager.getCurrentLanguage(context)
    
    ClutchPartnersTheme {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(40.dp))
            
            // Big Logo in Center
            Image(
                painter = painterResource(id = R.drawable.partners_logo_white),
                contentDescription = "Partners Logo",
                modifier = Modifier.size(120.dp)
            )
            
            Spacer(modifier = Modifier.height(40.dp))
            
            // Title
            Text(
                text = if (currentLanguage == "ar") "المصادقة" else "Authentication",
                style = MaterialTheme.typography.headlineLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = if (currentLanguage == "ar") "اختر طريقة تسجيل الدخول المناسبة لك" else "Choose your preferred authentication method",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(40.dp))
            
            // Authentication Options
            Column(
                verticalArrangement = Arrangement.spacedBy(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Sign In Option
                AuthOptionCard(
                    title = if (currentLanguage == "ar") "تسجيل الدخول" else "Sign In",
                    description = if (currentLanguage == "ar") "البريد الإلكتروني/الهاتف + كلمة المرور" else "Email/Phone + Password",
                    onClick = { navController.navigate(Screen.SignIn.route) }
                )
                
                // Sign Up Option
                AuthOptionCard(
                    title = if (currentLanguage == "ar") "إنشاء حساب" else "Sign Up",
                    description = if (currentLanguage == "ar") "معرف الشريك + البريد الإلكتروني/الهاتف + كلمة المرور" else "Partner ID + Email/Phone + Password",
                    onClick = { navController.navigate(Screen.SignUp.route) }
                )
                
                // Request to Join Option
                AuthOptionCard(
                    title = if (currentLanguage == "ar") "طلب الانضمام" else "Request to Join",
                    description = if (currentLanguage == "ar") "معلومات العمل + نوع المتجر" else "Business Info + Shop Type",
                    onClick = { navController.navigate(Screen.RequestToJoin.route) }
                )
            }
            
            Spacer(modifier = Modifier.weight(1f))
        }
    }
}

@Composable
fun AuthOptionCard(
    title: String,
    description: String,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        shape = RoundedCornerShape(12.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = description,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                textAlign = TextAlign.Center
            )
        }
    }
}
