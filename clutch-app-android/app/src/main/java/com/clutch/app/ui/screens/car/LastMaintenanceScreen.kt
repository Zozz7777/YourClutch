package com.clutch.app.ui.screens.car

import androidx.compose.foundation.Image
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
import androidx.compose.material3.DatePicker
import androidx.compose.material3.DatePickerDialog
import androidx.compose.material3.rememberDatePickerState
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.clutch.app.R
import com.clutch.app.ui.theme.ClutchRed
import com.clutch.app.ui.theme.ClutchGrayDark
import com.clutch.app.utils.TranslationManager
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LastMaintenanceScreen(
    onNavigateBack: () -> Unit,
    onNavigateToServiceSelection: () -> Unit,
    onMaintenanceCompleted: () -> Unit,
    initialDate: String? = null,
    initialServices: List<String> = emptyList(),
    initialKilometers: String = "",
    onDataChange: (String?, List<String>, String) -> Unit = { _, _, _ -> }
) {
    val context = LocalContext.current
    
    var selectedDate by remember { mutableStateOf<Date?>(null) }
    var selectedServices by remember { mutableStateOf(initialServices) }
    var kilometers by remember { mutableStateOf(initialKilometers) }
    var showDatePicker by remember { mutableStateOf(false) }
    
    // Initialize date from initialDate parameter
    LaunchedEffect(initialDate) {
        if (initialDate != null && selectedDate == null) {
            try {
                val date = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault()).parse(initialDate)
                selectedDate = date
            } catch (e: Exception) {
                // Handle parsing error silently
            }
        }
    }
    
    val dateFormatter = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
    val isFormValid = selectedDate != null && selectedServices.isNotEmpty() && kilometers.isNotEmpty()
    
    // No need for success state handling since we're using the callback directly

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = TranslationManager.getString(context, R.string.last_maintenance),
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
                actions = {
                    Image(
                        painter = painterResource(id = R.drawable.clutch_logo_red),
                        contentDescription = "Clutch Logo",
                        modifier = Modifier
                            .size(48.dp)
                            .padding(end = 16.dp)
                    )
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
                .padding(horizontal = 24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Spacer(modifier = Modifier.height(32.dp))

            // Date Selection Button
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { showDatePicker = true }
            ) {
                OutlinedTextField(
                    value = selectedDate?.let { dateFormatter.format(it) } ?: "",
                    onValueChange = { },
                    label = { Text(TranslationManager.getString(context, R.string.date)) },
                    readOnly = true,
                    enabled = false,
                    trailingIcon = {
                        Icon(
                            imageVector = Icons.Default.CalendarToday,
                            contentDescription = "Select Date",
                            tint = ClutchGrayDark
                        )
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = ClutchRed,
                        focusedLabelColor = ClutchRed,
                        unfocusedBorderColor = ClutchGrayDark,
                        unfocusedLabelColor = ClutchGrayDark,
                        focusedTextColor = ClutchGrayDark,
                        unfocusedTextColor = ClutchGrayDark,
                        disabledBorderColor = ClutchGrayDark,
                        disabledLabelColor = ClutchGrayDark,
                        disabledTextColor = ClutchGrayDark
                    )
                )
            }

            // Service Selection Button
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateToServiceSelection() }
            ) {
                OutlinedTextField(
                    value = if (selectedServices.isEmpty()) "" else selectedServices.joinToString(", "),
                    onValueChange = { },
                    label = { Text(TranslationManager.getString(context, R.string.what_did_you_do)) },
                    readOnly = true,
                    enabled = false,
                    trailingIcon = {
                        Icon(
                            imageVector = Icons.Default.KeyboardArrowDown,
                            contentDescription = "Select Services",
                            tint = ClutchGrayDark
                        )
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = ClutchRed,
                        focusedLabelColor = ClutchRed,
                        unfocusedBorderColor = ClutchGrayDark,
                        unfocusedLabelColor = ClutchGrayDark,
                        focusedTextColor = ClutchGrayDark,
                        unfocusedTextColor = ClutchGrayDark,
                        disabledBorderColor = ClutchGrayDark,
                        disabledLabelColor = ClutchGrayDark,
                        disabledTextColor = ClutchGrayDark
                    )
                )
            }

            // Kilometers Input
            OutlinedTextField(
                value = kilometers,
                onValueChange = { 
                    kilometers = it
                    onDataChange(selectedDate?.let { dateFormatter.format(it) }, selectedServices, kilometers)
                },
                label = { Text(TranslationManager.getString(context, R.string.kilometers)) },
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Number,
                    imeAction = androidx.compose.ui.text.input.ImeAction.Done
                ),
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = ClutchRed,
                    focusedLabelColor = ClutchRed,
                    unfocusedBorderColor = ClutchGrayDark,
                    unfocusedLabelColor = ClutchGrayDark,
                    focusedTextColor = ClutchGrayDark,
                    unfocusedTextColor = ClutchGrayDark
                )
            )

            Spacer(modifier = Modifier.weight(1f))

            // Skip Text (clickable)
            Text(
                text = TranslationManager.getString(context, R.string.skip),
                fontSize = 16.sp,
                color = ClutchRed,
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { 
                        // Navigate to emergency order or next screen
                        onMaintenanceCompleted()
                    }
                    .padding(vertical = 8.dp),
                textAlign = TextAlign.Center
            )
            
            // Confirm Button
            Button(
                onClick = { 
                    selectedDate?.let { date ->
                        val dateString = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(date)
                        // Call the onMaintenanceCompleted callback to trigger the proper car maintenance update
                        onMaintenanceCompleted()
                    }
                },
                enabled = isFormValid,
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
                    text = TranslationManager.getString(context, R.string.confirm),
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }

    // Date Picker Dialog
    if (showDatePicker) {
        val datePickerState = rememberDatePickerState(
            initialSelectedDateMillis = selectedDate?.time ?: System.currentTimeMillis()
        )
        
        AlertDialog(
            onDismissRequest = { showDatePicker = false },
            title = {
                Text(
                    text = "Select Date",
                    color = ClutchRed,
                    fontWeight = FontWeight.Bold
                )
            },
            text = {
                DatePicker(
                    state = datePickerState,
                    colors = DatePickerDefaults.colors(
                        containerColor = Color.White,
                        titleContentColor = ClutchRed,
                        headlineContentColor = ClutchRed,
                        weekdayContentColor = ClutchGrayDark,
                        subheadContentColor = ClutchGrayDark,
                        yearContentColor = ClutchGrayDark,
                        currentYearContentColor = ClutchRed,
                        selectedYearContentColor = Color.White,
                        selectedYearContainerColor = ClutchRed,
                        dayContentColor = ClutchGrayDark,
                        disabledDayContentColor = ClutchGrayDark.copy(alpha = 0.3f),
                        selectedDayContentColor = Color.White,
                        disabledSelectedDayContentColor = Color.White.copy(alpha = 0.3f),
                        selectedDayContainerColor = ClutchRed,
                        disabledSelectedDayContainerColor = ClutchRed.copy(alpha = 0.3f),
                        todayContentColor = ClutchRed,
                        todayDateBorderColor = ClutchRed,
                        dayInSelectionRangeContentColor = Color.White,
                        dayInSelectionRangeContainerColor = ClutchRed.copy(alpha = 0.6f)
                    )
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        datePickerState.selectedDateMillis?.let {
                            selectedDate = Date(it)
                            onDataChange(selectedDate?.let { dateFormatter.format(it) }, selectedServices, kilometers)
                        }
                        showDatePicker = false
                    },
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = ClutchRed
                    )
                ) {
                    Text(
                        text = TranslationManager.getString(context, R.string.ok),
                        fontWeight = FontWeight.Bold
                    )
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showDatePicker = false },
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = ClutchGrayDark
                    )
                ) {
                    Text(TranslationManager.getString(context, R.string.cancel))
                }
            },
            containerColor = Color.White,
            titleContentColor = ClutchRed,
            textContentColor = ClutchGrayDark
        )
    }
}

@Composable
fun DatePickerDialog(
    onDismissRequest: () -> Unit,
    confirmButton: @Composable () -> Unit,
    dismissButton: @Composable (() -> Unit)? = null,
    content: @Composable () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismissRequest,
        confirmButton = confirmButton,
        dismissButton = dismissButton,
        text = content,
        containerColor = Color.White,
        titleContentColor = ClutchRed,
        textContentColor = ClutchGrayDark,
        iconContentColor = ClutchRed
    )
}
