package com.clutch.app.ui.screens.car

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
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
import com.clutch.app.R
import com.clutch.app.ui.theme.ClutchRed
import com.clutch.app.utils.TranslationManager
import com.clutch.app.ui.viewmodel.ModelSelectionViewModel
import com.clutch.app.ui.components.LoadingIndicator
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.hilt.navigation.compose.hiltViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ModelSelectionScreen(
    selectedBrand: String,
    onNavigateBack: () -> Unit,
    onModelSelected: (String) -> Unit,
    viewModel: ModelSelectionViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    var selectedModel by remember { mutableStateOf("") }
    
    // Load models when screen opens
    LaunchedEffect(selectedBrand) {
        viewModel.loadModels(selectedBrand)
    }
    // Models are now loaded from API via ViewModel

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = TranslationManager.getString(context, R.string.model),
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
                .background(Color.White)
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
        ) {
            Spacer(modifier = Modifier.height(16.dp))

            // Search Bar
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = { viewModel.searchModels(it) },
                placeholder = { 
                    Text(
                        text = TranslationManager.getString(context, R.string.find_your_car),
                        color = Color.LightGray
                    )
                },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Default.Search,
                        contentDescription = "Search",
                        tint = Color.LightGray
                    )
                },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = ClutchRed,
                    unfocusedBorderColor = Color.LightGray,
                    focusedTextColor = Color.Black,
                    unfocusedTextColor = Color.Black
                ),
                shape = RoundedCornerShape(8.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Selected Brand Display
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = ClutchRed),
                shape = RoundedCornerShape(8.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.KeyboardArrowDown,
                            contentDescription = "Change Brand",
                            tint = Color.White
                        )
                        
                        Text(
                            text = selectedBrand.uppercase(),
                            color = Color.White,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    
                    // Brand logo placeholder
                    Icon(
                        imageVector = Icons.Default.DirectionsCar,
                        contentDescription = "Brand Logo",
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Models List
            when {
                uiState.isLoading -> {
                    LoadingIndicator(
                        message = "Loading models...",
                        modifier = Modifier.fillMaxWidth()
                    )
                }
                uiState.errorMessage != null -> {
                    Box(
                        modifier = Modifier.fillMaxWidth(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = uiState.errorMessage ?: "Unknown error",
                            color = Color.Red,
                            textAlign = TextAlign.Center
                        )
                    }
                }
                uiState.filteredModels.isEmpty() -> {
                    Box(
                        modifier = Modifier.fillMaxWidth(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No models found",
                            color = Color.Gray,
                            textAlign = TextAlign.Center
                        )
                    }
                }
                else -> {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(uiState.filteredModels) { model ->
                            ModelItem(
                                model = model.name,
                                isSelected = selectedModel == model.name,
                                onClick = { 
                                    selectedModel = model.name
                                    onModelSelected(model.name)
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ModelItem(
    model: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val backgroundColor = if (isSelected) Color(0xFFFFE0E0) else Color(0xFFF5F5F5)
    val textColor = Color.Black

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        colors = CardDefaults.cardColors(containerColor = backgroundColor),
        shape = RoundedCornerShape(8.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = model,
                color = textColor,
                fontSize = 16.sp,
                fontWeight = FontWeight.Medium
            )
            
            // Selection indicator
            Box(
                modifier = Modifier
                    .size(16.dp)
                    .background(
                        color = if (isSelected) ClutchRed else Color.LightGray,
                        shape = RoundedCornerShape(2.dp)
                    )
            )
        }
    }
}
