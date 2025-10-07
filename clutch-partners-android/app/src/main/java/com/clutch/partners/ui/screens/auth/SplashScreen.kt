package com.clutch.partners.ui.screens.auth

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.clutch.partners.ClutchPartnersTheme
import com.clutch.partners.R
import com.clutch.partners.navigation.Screen
import com.clutch.partners.viewmodel.AuthViewModel
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    navController: NavController,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var isVisible by remember { mutableStateOf(false) }
    
    // Animation for fade in
    val alpha by animateFloatAsState(
        targetValue = if (isVisible) 1f else 0f,
        animationSpec = tween(1000),
        label = "alpha"
    )
    
    LaunchedEffect(Unit) {
        delay(100)
        isVisible = true
        delay(2000) // Show splash for 2 seconds
        
        if (uiState.isAuthenticated) {
            navController.navigate(Screen.Main.route) {
                popUpTo(Screen.Splash.route) { inclusive = true }
            }
        } else {
            navController.navigate(Screen.Onboarding.route) {
                popUpTo(Screen.Splash.route) { inclusive = true }
            }
        }
    }
    
    ClutchPartnersTheme {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black), // Black background as requested
            contentAlignment = Alignment.Center
        ) {
            // Logo inside the rotor circle - both centered
            Box(
                modifier = Modifier.size(380.dp),
                contentAlignment = Alignment.Center
            ) {
                // Animated Rotor - centered and 1.5x size
                AnimatedRotor()
                
                // White Partners Logo inside the rotor circle
                Image(
                    painter = painterResource(id = R.drawable.partners_logo_white),
                    contentDescription = "Partners Logo",
                    modifier = Modifier.size(120.dp)
                )
            }
        }
    }
}

@Composable
fun AnimatedRotor() {
    val infiniteTransition = rememberInfiniteTransition(label = "rotor")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )
    
    Image(
        painter = painterResource(id = R.drawable.rotor_partner), // Using partner rotor image
        contentDescription = "Loading Rotor",
        modifier = Modifier
            .size(380.dp) // Even bigger rotor size
            .graphicsLayer {
                rotationZ = rotation
            }
    )
}
