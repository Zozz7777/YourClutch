package com.clutch.partners.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import java.util.Date

@Composable
fun FormSection(
    title: String,
    content: @Composable () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            content()
        }
    }
}

@Composable
fun FormField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    isRequired: Boolean = false,
    isEnabled: Boolean = true,
    keyboardType: KeyboardType = KeyboardType.Text,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    leadingIcon: ImageVector? = null,
    trailingIcon: ImageVector? = null,
    onTrailingIconClick: (() -> Unit)? = null,
    errorMessage: String? = null,
    supportingText: String? = null
) {
    Column(
        modifier = modifier.fillMaxWidth()
    ) {
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            label = { 
                Text(
                    text = if (isRequired) "$label *" else label,
                    color = if (errorMessage != null) MaterialTheme.colorScheme.error 
                           else MaterialTheme.colorScheme.onSurfaceVariant
                )
            },
            placeholder = { Text(placeholder) },
            enabled = isEnabled,
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
            visualTransformation = visualTransformation,
            leadingIcon = leadingIcon?.let { icon ->
                { Icon(imageVector = icon, contentDescription = null) }
            },
            trailingIcon = trailingIcon?.let { icon ->
                { 
                    IconButton(onClick = { onTrailingIconClick?.invoke() }) {
                        Icon(imageVector = icon, contentDescription = null)
                    }
                }
            },
            isError = errorMessage != null,
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = MaterialTheme.colorScheme.primary,
                unfocusedBorderColor = MaterialTheme.colorScheme.outline,
                errorBorderColor = MaterialTheme.colorScheme.error
            )
        )
        
        if (errorMessage != null) {
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = errorMessage,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.error
            )
        }
        
        if (supportingText != null && errorMessage == null) {
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = supportingText,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun FormDropdown(
    label: String,
    selectedValue: String,
    onValueChange: (String) -> Unit,
    options: List<String>,
    modifier: Modifier = Modifier,
    placeholder: String = "Select an option",
    isRequired: Boolean = false,
    isEnabled: Boolean = true,
    errorMessage: String? = null,
    supportingText: String? = null
) {
    var expanded by remember { mutableStateOf(false) }
    
    Column(
        modifier = modifier.fillMaxWidth()
    ) {
        OutlinedTextField(
            value = selectedValue,
            onValueChange = { },
            label = { 
                Text(
                    text = if (isRequired) "$label *" else label,
                    color = if (errorMessage != null) MaterialTheme.colorScheme.error 
                           else MaterialTheme.colorScheme.onSurfaceVariant
                )
            },
            placeholder = { Text(placeholder) },
            enabled = isEnabled,
            readOnly = true,
            trailingIcon = {
                IconButton(onClick = { expanded = true }) {
                    Icon(
                        imageVector = if (expanded) Icons.Default.KeyboardArrowUp else Icons.Default.KeyboardArrowDown,
                        contentDescription = null
                    )
                }
            },
            isError = errorMessage != null,
            modifier = Modifier
                .fillMaxWidth()
                .clickable { expanded = true },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = MaterialTheme.colorScheme.primary,
                unfocusedBorderColor = MaterialTheme.colorScheme.outline,
                errorBorderColor = MaterialTheme.colorScheme.error
            )
        )
        
        DropdownMenu(
            expanded = expanded,
            onDismissRequest = { expanded = false }
        ) {
            options.forEach { option ->
                DropdownMenuItem(
                    text = { Text(option) },
                    onClick = {
                        onValueChange(option)
                        expanded = false
                    }
                )
            }
        }
        
        if (errorMessage != null) {
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = errorMessage,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.error
            )
        }
        
        if (supportingText != null && errorMessage == null) {
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = supportingText,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun FormDatePicker(
    label: String,
    selectedDate: Date?,
    onDateSelected: (Date) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "Select date",
    isRequired: Boolean = false,
    isEnabled: Boolean = true,
    errorMessage: String? = null,
    supportingText: String? = null
) {
    var showDatePicker by remember { mutableStateOf(false) }
    
    Column(
        modifier = modifier.fillMaxWidth()
    ) {
        OutlinedTextField(
            value = selectedDate?.let { formatDate(it) } ?: "",
            onValueChange = { },
            label = { 
                Text(
                    text = if (isRequired) "$label *" else label,
                    color = if (errorMessage != null) MaterialTheme.colorScheme.error 
                           else MaterialTheme.colorScheme.onSurfaceVariant
                )
            },
            placeholder = { Text(placeholder) },
            enabled = isEnabled,
            readOnly = true,
            trailingIcon = {
                IconButton(onClick = { showDatePicker = true }) {
                    Icon(
                        imageVector = Icons.Default.CalendarToday,
                        contentDescription = "Select date"
                    )
                }
            },
            isError = errorMessage != null,
            modifier = Modifier
                .fillMaxWidth()
                .clickable { showDatePicker = true },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = MaterialTheme.colorScheme.primary,
                unfocusedBorderColor = MaterialTheme.colorScheme.outline,
                errorBorderColor = MaterialTheme.colorScheme.error
            )
        )
        
        if (errorMessage != null) {
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = errorMessage,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.error
            )
        }
        
        if (supportingText != null && errorMessage == null) {
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = supportingText,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
    
    if (showDatePicker) {
        // DatePickerDialog would be implemented here
        // For now, we'll just close the picker
        LaunchedEffect(showDatePicker) {
            showDatePicker = false
        }
    }
}

@Composable
fun FormTimePicker(
    label: String,
    selectedTime: String,
    onTimeSelected: (String) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "Select time",
    isRequired: Boolean = false,
    isEnabled: Boolean = true,
    errorMessage: String? = null,
    supportingText: String? = null
) {
    var showTimePicker by remember { mutableStateOf(false) }
    
    Column(
        modifier = modifier.fillMaxWidth()
    ) {
        OutlinedTextField(
            value = selectedTime,
            onValueChange = { },
            label = { 
                Text(
                    text = if (isRequired) "$label *" else label,
                    color = if (errorMessage != null) MaterialTheme.colorScheme.error 
                           else MaterialTheme.colorScheme.onSurfaceVariant
                )
            },
            placeholder = { Text(placeholder) },
            enabled = isEnabled,
            readOnly = true,
            trailingIcon = {
                IconButton(onClick = { showTimePicker = true }) {
                    Icon(
                        imageVector = Icons.Default.AccessTime,
                        contentDescription = "Select time"
                    )
                }
            },
            isError = errorMessage != null,
            modifier = Modifier
                .fillMaxWidth()
                .clickable { showTimePicker = true },
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = MaterialTheme.colorScheme.primary,
                unfocusedBorderColor = MaterialTheme.colorScheme.outline,
                errorBorderColor = MaterialTheme.colorScheme.error
            )
        )
        
        if (errorMessage != null) {
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = errorMessage,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.error
            )
        }
        
        if (supportingText != null && errorMessage == null) {
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = supportingText,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
    
    if (showTimePicker) {
        // TimePickerDialog would be implemented here
        // For now, we'll just close the picker
        LaunchedEffect(showTimePicker) {
            showTimePicker = false
        }
    }
}

@Composable
fun FormSwitch(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
    supportingText: String? = null,
    isEnabled: Boolean = true
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            if (supportingText != null) {
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = supportingText,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange,
            enabled = isEnabled
        )
    }
}

@Composable
fun FormCheckbox(
    label: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
    supportingText: String? = null,
    isEnabled: Boolean = true
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top
    ) {
        Checkbox(
            checked = checked,
            onCheckedChange = onCheckedChange,
            enabled = isEnabled
        )
        
        Spacer(modifier = Modifier.width(8.dp))
        
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = label,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            if (supportingText != null) {
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = supportingText,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun FormRadioGroup(
    label: String,
    options: List<String>,
    selectedOption: String,
    onOptionSelected: (String) -> Unit,
    modifier: Modifier = Modifier,
    isEnabled: Boolean = true
) {
    Column(
        modifier = modifier.fillMaxWidth()
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurface
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        options.forEach { option ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { if (isEnabled) onOptionSelected(option) }
                    .padding(vertical = 4.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                RadioButton(
                    selected = selectedOption == option,
                    onClick = { if (isEnabled) onOptionSelected(option) },
                    enabled = isEnabled
                )
                
                Spacer(modifier = Modifier.width(8.dp))
                
                Text(
                    text = option,
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (isEnabled) MaterialTheme.colorScheme.onSurface 
                           else MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun FormButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    isEnabled: Boolean = true,
    isLoading: Boolean = false,
    buttonType: ButtonType = ButtonType.Primary
) {
    Button(
        onClick = onClick,
        enabled = isEnabled && !isLoading,
        modifier = modifier.fillMaxWidth(),
        colors = when (buttonType) {
            ButtonType.Primary -> ButtonDefaults.buttonColors()
            ButtonType.Secondary -> ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.secondary
            )
            ButtonType.Outlined -> ButtonDefaults.outlinedButtonColors()
        }
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.size(16.dp),
                color = MaterialTheme.colorScheme.onPrimary
            )
            
            Spacer(modifier = Modifier.width(8.dp))
        }
        
        Text(text)
    }
}

@Composable
fun FormActions(
    primaryButtonText: String,
    onPrimaryClick: () -> Unit,
    modifier: Modifier = Modifier,
    secondaryButtonText: String? = null,
    onSecondaryClick: (() -> Unit)? = null,
    isPrimaryLoading: Boolean = false,
    isSecondaryLoading: Boolean = false,
    isPrimaryEnabled: Boolean = true,
    isSecondaryEnabled: Boolean = true
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        if (secondaryButtonText != null && onSecondaryClick != null) {
            OutlinedButton(
                onClick = onSecondaryClick,
                enabled = isSecondaryEnabled && !isSecondaryLoading,
                modifier = Modifier.weight(1f)
            ) {
                if (isSecondaryLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        color = MaterialTheme.colorScheme.primary
                    )
                    
                    Spacer(modifier = Modifier.width(8.dp))
                }
                
                Text(secondaryButtonText)
            }
        }
        
        Button(
            onClick = onPrimaryClick,
            enabled = isPrimaryEnabled && !isPrimaryLoading,
            modifier = Modifier.weight(1f)
        ) {
            if (isPrimaryLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.size(16.dp),
                    color = MaterialTheme.colorScheme.onPrimary
                )
                
                Spacer(modifier = Modifier.width(8.dp))
            }
            
            Text(primaryButtonText)
        }
    }
}

// Helper functions
private fun formatDate(date: Date): String {
    val formatter = java.text.SimpleDateFormat("MMM dd, yyyy", java.util.Locale.getDefault())
    return formatter.format(date)
}

// Enums
enum class ButtonType {
    Primary,
    Secondary,
    Outlined
}
