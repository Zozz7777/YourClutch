package com.clutch.partners.ui.screens.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.clutch.partners.ClutchPartnersTheme
import com.clutch.partners.R
import com.clutch.partners.data.model.PartnerType
import com.clutch.partners.navigation.Screen
import com.clutch.partners.utils.LanguageManager
import com.clutch.partners.viewmodel.AuthViewModel

@Composable
fun PartnerTypeSelectorScreen(
    navController: NavController,
    viewModel: AuthViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    var selectedType by remember { mutableStateOf<PartnerType?>(null) }
    val currentLanguage = LanguageManager.getCurrentLanguage(context)
    
    ClutchPartnersTheme {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Header with logo and title
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Partners Logo (White)
                Image(
                    painter = painterResource(id = R.drawable.partners_logo_white),
                    contentDescription = "Partners Logo",
                    modifier = Modifier.size(60.dp)
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Title
                Text(
                    text = if (currentLanguage == "ar") "اختر نوع عملك" else "Select Your Business Type",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground,
                    textAlign = TextAlign.Center
                )
                
                Spacer(modifier = Modifier.height(8.dp))
                
                Text(
                    text = if (currentLanguage == "ar") "اختر النوع الذي يصف عملك بشكل أفضل" else "Choose the type that best describes your business",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f),
                    textAlign = TextAlign.Center
                )
            }
            
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 24.dp)
            ) {
                Spacer(modifier = Modifier.height(16.dp))
                
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    items(PartnerType.values().toList()) { type ->
                        PartnerTypeCard(
                            type = type,
                            isSelected = selectedType == type,
                            onClick = { selectedType = type },
                            currentLanguage = currentLanguage
                        )
                    }
                }
                
                Spacer(modifier = Modifier.weight(1f))
                
                Button(
                    onClick = { 
                        selectedType?.let {
                            navController.navigate(Screen.Auth.route)
                        }
                    },
                    enabled = selectedType != null,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (selectedType != null) Color(0xFF242424) else MaterialTheme.colorScheme.primary.copy(alpha = 0.3f),
                        contentColor = if (selectedType != null) Color.White else MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.5f)
                    )
                ) {
                    Text(
                        text = if (currentLanguage == "ar") "متابعة" else "Continue",
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }
        }
    }
}

@Composable
fun PartnerTypeCard(
    type: PartnerType,
    isSelected: Boolean,
    onClick: () -> Unit,
    currentLanguage: String
) {
    val (title, description, icon) = when (type) {
        PartnerType.REPAIR_CENTER -> if (currentLanguage == "ar") Triple(
            "مركز إصلاح",
            "خدمات إصلاح وصيانة السيارات",
            Icons.Default.Build
        ) else Triple(
            "Repair Center",
            "Auto repair and maintenance services",
            Icons.Default.Build
        )
        PartnerType.AUTO_PARTS -> if (currentLanguage == "ar") Triple(
            "قطع غيار",
            "بيع قطع غيار وإكسسوارات السيارات",
            Icons.Default.Settings
        ) else Triple(
            "Auto Parts",
            "Sell automotive parts and accessories",
            Icons.Default.Settings
        )
        PartnerType.ACCESSORIES -> if (currentLanguage == "ar") Triple(
            "إكسسوارات",
            "إكسسوارات وتخصيص السيارات",
            Icons.Default.Star
        ) else Triple(
            "Accessories",
            "Car accessories and customization",
            Icons.Default.Star
        )
        PartnerType.IMPORTER -> if (currentLanguage == "ar") Triple(
            "مستورد",
            "استيراد وتوزيع منتجات السيارات",
            Icons.Default.LocalShipping
        ) else Triple(
            "Importer",
            "Import and distribute automotive products",
            Icons.Default.LocalShipping
        )
        PartnerType.MANUFACTURER -> if (currentLanguage == "ar") Triple(
            "مصنع",
            "تصنيع منتجات السيارات",
            Icons.Default.Settings
        ) else Triple(
            "Manufacturer",
            "Manufacture automotive products",
            Icons.Default.Settings
        )
        PartnerType.SERVICE_CENTER -> if (currentLanguage == "ar") Triple(
            "مركز خدمة",
            "خدمات شاملة للسيارات",
            Icons.Default.AutoFixHigh
        ) else Triple(
            "Service Center",
            "Comprehensive automotive services",
            Icons.Default.AutoFixHigh
        )
    }
    
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) Color.White else MaterialTheme.colorScheme.surface
        ),
        border = if (isSelected) 
            CardDefaults.outlinedCardBorder().copy(
                brush = androidx.compose.ui.graphics.SolidColor(MaterialTheme.colorScheme.primary)
            )
        else null
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = null,
                modifier = Modifier.size(32.dp),
                tint = if (isSelected) Color.Gray else MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
                color = if (isSelected) Color.Gray else MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall,
                textAlign = TextAlign.Center,
                color = if (isSelected) Color.Gray.copy(alpha = 0.7f) else MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )
        }
    }
}
