package com.clutch.partners.ui.screens.auth

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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.clutch.partners.ClutchPartnersTheme
import com.clutch.partners.data.model.PartnerType
import com.clutch.partners.navigation.Screen
import com.clutch.partners.viewmodel.AuthViewModel

@Composable
fun PartnerTypeSelectorScreen(
    navController: NavController,
    viewModel: AuthViewModel = hiltViewModel()
) {
    var selectedType by remember { mutableStateOf<PartnerType?>(null) }
    
    ClutchPartnersTheme {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
                .padding(24.dp)
        ) {
            Text(
                text = "Select Your Business Type",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Choose the type that best describes your business",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.7f)
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            LazyVerticalGrid(
                columns = GridCells.Fixed(2),
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                items(PartnerType.values().toList()) { type ->
                    PartnerTypeCard(
                        type = type,
                        isSelected = selectedType == type,
                        onClick = { selectedType = type }
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
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Continue")
            }
        }
    }
}

@Composable
fun PartnerTypeCard(
    type: PartnerType,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val (title, description, icon) = when (type) {
        PartnerType.REPAIR_CENTER -> Triple(
            "Repair Center",
            "Auto repair and maintenance services",
            Icons.Default.Build
        )
        PartnerType.AUTO_PARTS -> Triple(
            "Auto Parts",
            "Sell automotive parts and accessories",
            Icons.Default.Settings
        )
        PartnerType.ACCESSORIES -> Triple(
            "Accessories",
            "Car accessories and customization",
            Icons.Default.Star
        )
        PartnerType.IMPORTER -> Triple(
            "Importer",
            "Import and distribute automotive products",
            Icons.Default.LocalShipping
        )
        PartnerType.MANUFACTURER -> Triple(
            "Manufacturer",
            "Manufacture automotive products",
            Icons.Default.Settings
        )
        PartnerType.SERVICE_CENTER -> Triple(
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
            containerColor = if (isSelected) 
                MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
            else MaterialTheme.colorScheme.surface
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
                tint = if (isSelected) 
                    MaterialTheme.colorScheme.primary 
                else MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
                color = if (isSelected) 
                    MaterialTheme.colorScheme.primary 
                else MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )
        }
    }
}
