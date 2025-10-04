package com.clutch.app.ui.screens.car

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.clutch.app.R
import com.clutch.app.data.model.MaintenanceType
import com.clutch.app.ui.theme.ClutchRed
import com.clutch.app.ui.theme.ClutchGrayDark
import com.clutch.app.ui.viewmodel.MaintenanceViewModel
import com.clutch.app.utils.TranslationManager
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ServiceSelectionScreen(
    onNavigateBack: () -> Unit,
    onServicesSelected: (List<String>) -> Unit,
    selectedServices: List<String> = emptyList()
) {
    val context = LocalContext.current
    val viewModel = androidx.hilt.navigation.compose.hiltViewModel<MaintenanceViewModel>()
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    var selectedServiceIds by remember { mutableStateOf(selectedServices) }
    var otherText by remember { mutableStateOf("") }

    // Load maintenance types when screen opens
    LaunchedEffect(Unit) {
        viewModel.loadMaintenanceTypes()
    }
    
    // Update selected services when initial data changes
    LaunchedEffect(selectedServices) {
        selectedServiceIds = selectedServices
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = TranslationManager.getString(context, R.string.what_did_you_do),
                        color = ClutchRed,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = ClutchRed
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF5F5F5))
                .padding(paddingValues)
                .padding(horizontal = 24.dp)
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // Instructions
            Text(
                text = TranslationManager.getString(context, R.string.select_maintenance_type),
                fontSize = 16.sp,
                color = ClutchGrayDark,
                modifier = Modifier.padding(bottom = 8.dp)
            )

            // Services list or loading/error states
            Box(
                modifier = Modifier.weight(1f)
            ) {
                // Loading state
                if (uiState.isLoading) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = ClutchRed)
                    }
                }
                // Error state
                else if (uiState.errorMessage != null) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFEBEE))
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.Error,
                                contentDescription = "Error",
                                tint = ClutchRed,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = uiState.errorMessage ?: "Unknown error occurred",
                                color = ClutchRed,
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = { viewModel.loadMaintenanceTypes() },
                                colors = ButtonDefaults.buttonColors(containerColor = ClutchRed)
                            ) {
                                Text(
                                    text = TranslationManager.getString(context, R.string.retry),
                                    color = Color.White
                                )
                            }
                        }
                    }
                }
                // Services list
                else {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(uiState.maintenanceTypes) { maintenanceType ->
                            ServiceItem(
                                maintenanceType = maintenanceType,
                                isSelected = selectedServiceIds.contains(maintenanceType.name),
                                onToggleSelection = { serviceName ->
                                    selectedServiceIds = if (selectedServiceIds.contains(serviceName)) {
                                        selectedServiceIds - serviceName
                                    } else {
                                        selectedServiceIds + serviceName
                                    }
                                }
                            )
                        }
                    }
                }
            }

            // Other things section (always visible)
            Spacer(modifier = Modifier.height(16.dp))
            
            Text(
                text = "OTHER THINGS? TYPE HERE",
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium,
                color = ClutchGrayDark,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            
            OutlinedTextField(
                value = otherText,
                onValueChange = { otherText = it },
                placeholder = { 
                    Text(
                        text = "Type your custom maintenance details here...",
                        color = ClutchGrayDark.copy(alpha = 0.6f)
                    )
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = ClutchRed,
                    unfocusedBorderColor = ClutchGrayDark.copy(alpha = 0.5f),
                    focusedTextColor = ClutchGrayDark,
                    unfocusedTextColor = ClutchGrayDark
                ),
                keyboardOptions = KeyboardOptions(
                    imeAction = ImeAction.Done
                ),
                maxLines = 4,
                shape = RoundedCornerShape(12.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Done Button (always visible)
            Button(
                onClick = { 
                    // Combine selected services with other text
                    val allServices = if (otherText.isNotBlank()) {
                        selectedServiceIds + otherText
                    } else {
                        selectedServiceIds
                    }
                    onServicesSelected(allServices)
                    onNavigateBack()
                },
                enabled = selectedServiceIds.isNotEmpty() || otherText.isNotBlank(),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = ClutchRed,
                    disabledContainerColor = ClutchGrayDark
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "DONE",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
fun ServiceItem(
    maintenanceType: MaintenanceType,
    isSelected: Boolean,
    onToggleSelection: (String) -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onToggleSelection(maintenanceType.name) },
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) ClutchRed.copy(alpha = 0.1f) else Color.White
        ),
        border = androidx.compose.foundation.BorderStroke(
            width = if (isSelected) 2.dp else 1.dp,
            color = if (isSelected) ClutchRed else ClutchGrayDark.copy(alpha = 0.3f)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Selection indicator
            Icon(
                imageVector = if (isSelected) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked,
                contentDescription = if (isSelected) "Selected" else "Not selected",
                tint = if (isSelected) ClutchRed else ClutchGrayDark,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.width(16.dp))
            
            // Service info
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = maintenanceType.name,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (isSelected) ClutchRed else ClutchGrayDark
                )
                if (!maintenanceType.description.isNullOrEmpty()) {
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = maintenanceType.description ?: "",
                        fontSize = 14.sp,
                        color = ClutchGrayDark.copy(alpha = 0.7f)
                    )
                }
            }
        }
    }
}