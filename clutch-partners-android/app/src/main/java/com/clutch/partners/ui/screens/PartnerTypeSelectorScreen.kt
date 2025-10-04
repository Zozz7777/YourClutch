package com.clutch.partners.ui.screens

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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.runtime.CompositionLocalProvider
import com.clutch.partners.ui.theme.*
import com.clutch.partners.utils.LanguageManager

@Composable
fun PartnerTypeSelectorScreen(
    onPartnerTypeSelected: (PartnerType) -> Unit
) {
    val context = LocalContext.current
    val isRTL = LanguageManager.isRTL(context)
    val layoutDirection = if (isRTL) LayoutDirection.Rtl else LayoutDirection.Ltr
    
    CompositionLocalProvider(LocalLayoutDirection provides layoutDirection) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(if (isRTL) DarkBackground else LightBackground)
                .padding(24.dp)
        ) {
            // Header
            Text(
                text = if (isRTL) "اختر نوع متجرك" else "Choose Your Shop Type",
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = if (isRTL) "اختر نوع نشاطك التجاري لبدء استخدام التطبيق" else "Select your business type to get started",
                fontSize = 16.sp,
                color = if (isRTL) DarkMutedForeground else LightMutedForeground,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            // Partner Types Grid
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(PartnerType.values()) { partnerType ->
                    PartnerTypeCard(
                        partnerType = partnerType,
                        isRTL = isRTL,
                        onClick = { onPartnerTypeSelected(partnerType) }
                    )
                }
            }
        }
    }
}

@Composable
fun PartnerTypeCard(
    partnerType: PartnerType,
    isRTL: Boolean,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .shadow(
                elevation = 8.dp,
                shape = RoundedCornerShape(16.dp)
            ),
        colors = CardDefaults.cardColors(
            containerColor = if (isRTL) DarkCard else LightCard
        ),
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Icon
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .background(
                        partnerType.color.copy(alpha = 0.1f),
                        RoundedCornerShape(12.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = partnerType.icon,
                    contentDescription = null,
                    modifier = Modifier.size(32.dp),
                    tint = partnerType.color
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = if (isRTL) partnerType.arabicName else partnerType.englishName,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = if (isRTL) DarkForeground else LightForeground,
                textAlign = TextAlign.Center
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = if (isRTL) partnerType.arabicDescription else partnerType.englishDescription,
                fontSize = 12.sp,
                color = if (isRTL) DarkMutedForeground else LightMutedForeground,
                textAlign = TextAlign.Center,
                lineHeight = 16.sp
            )
        }
    }
}

enum class PartnerType(
    val englishName: String,
    val arabicName: String,
    val englishDescription: String,
    val arabicDescription: String,
    val icon: ImageVector,
    val color: Color
) {
    REPAIR_CENTER(
        englishName = "Repair Center",
        arabicName = "مركز إصلاح",
        englishDescription = "Auto repair and maintenance services",
        arabicDescription = "خدمات إصلاح وصيانة السيارات",
        icon = Icons.Filled.Build,
        color = PartnersBlue
    ),
    AUTO_PARTS_SHOP(
        englishName = "Auto Parts Shop",
        arabicName = "متجر قطع غيار",
        englishDescription = "Sell auto parts and accessories",
        arabicDescription = "بيع قطع غيار وإكسسوارات السيارات",
        icon = Icons.Filled.Store,
        color = LightSuccess
    ),
    ACCESSORIES_SHOP(
        englishName = "Accessories Shop",
        arabicName = "متجر إكسسوارات",
        englishDescription = "Car accessories and modifications",
        arabicDescription = "إكسسوارات وتعديلات السيارات",
        icon = Icons.Filled.ShoppingCart,
        color = Orange
    ),
    IMPORTER(
        englishName = "Importer",
        arabicName = "مستورد",
        englishDescription = "Import and distribute auto parts",
        arabicDescription = "استيراد وتوزيع قطع غيار السيارات",
        icon = Icons.Filled.LocalShipping,
        color = LightInfo
    ),
    MANUFACTURER(
        englishName = "Manufacturer",
        arabicName = "مصنع",
        englishDescription = "Manufacture auto parts and components",
        arabicDescription = "تصنيع قطع غيار ومكونات السيارات",
        icon = Icons.Filled.Build,
        color = LightWarning
    ),
    SERVICE_CENTER(
        englishName = "Service Center",
        arabicName = "مركز خدمة",
        englishDescription = "Comprehensive automotive services",
        arabicDescription = "خدمات شاملة للسيارات",
        icon = Icons.Filled.Settings,
        color = LightDestructive
    )
}
