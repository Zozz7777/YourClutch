package com.clutch.partners.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun SwipeAction(
    icon: ImageVector,
    label: String,
    backgroundColor: Color,
    iconColor: Color = Color.White,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isPressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.95f else 1f,
        animationSpec = tween(durationMillis = 100)
    )
    
    Card(
        modifier = modifier
            .scale(scale)
            .clickable { 
                isPressed = true
                onClick()
            },
        colors = CardDefaults.cardColors(containerColor = backgroundColor),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(12.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = iconColor,
                modifier = Modifier.size(20.dp)
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall,
                color = iconColor,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
fun ActionButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    isEnabled: Boolean = true,
    isLoading: Boolean = false,
    buttonType: ActionButtonType = ActionButtonType.Primary
) {
    var isPressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.98f else 1f,
        animationSpec = tween(durationMillis = 100)
    )
    
    Button(
        onClick = {
            isPressed = true
            onClick()
        },
        enabled = isEnabled && !isLoading,
        modifier = modifier
            .scale(scale),
        colors = when (buttonType) {
            ActionButtonType.Primary -> ButtonDefaults.buttonColors()
            ActionButtonType.Secondary -> ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.secondary
            )
            ActionButtonType.Outlined -> ButtonDefaults.outlinedButtonColors()
            ActionButtonType.Text -> ButtonDefaults.textButtonColors()
        }
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.size(16.dp),
                color = when (buttonType) {
                    ActionButtonType.Primary -> MaterialTheme.colorScheme.onPrimary
                    ActionButtonType.Secondary -> MaterialTheme.colorScheme.onSecondary
                    ActionButtonType.Outlined -> MaterialTheme.colorScheme.primary
                    ActionButtonType.Text -> MaterialTheme.colorScheme.primary
                }
            )
            
            Spacer(modifier = Modifier.width(8.dp))
        }
        
        icon?.let {
            Icon(
                imageVector = it,
                contentDescription = null,
                modifier = Modifier.size(18.dp)
            )
            
            Spacer(modifier = Modifier.width(8.dp))
        }
        
        Text(text)
    }
}

@Composable
fun FloatingActionButton(
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    contentDescription: String = "Add",
    backgroundColor: Color = MaterialTheme.colorScheme.primary,
    iconColor: Color = MaterialTheme.colorScheme.onPrimary
) {
    var isPressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.9f else 1f,
        animationSpec = tween(durationMillis = 100)
    )
    
    FloatingActionButton(
        onClick = {
            isPressed = true
            onClick()
        },
        modifier = modifier
            .scale(scale),
        containerColor = backgroundColor,
        contentColor = iconColor
    ) {
        Icon(
            imageVector = icon,
            contentDescription = contentDescription
        )
    }
}

@Composable
fun IconButton(
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    contentDescription: String? = null,
    isEnabled: Boolean = true,
    backgroundColor: Color? = null,
    iconColor: Color = MaterialTheme.colorScheme.onSurface
) {
    var isPressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.9f else 1f,
        animationSpec = tween(durationMillis = 100)
    )
    
    androidx.compose.material3.IconButton(
        onClick = {
            isPressed = true
            onClick()
        },
        enabled = isEnabled,
        modifier = modifier
            .scale(scale)
            .then(
                backgroundColor?.let {
                    Modifier
                        .clip(CircleShape)
                        .background(it)
                } ?: Modifier
            )
    ) {
        Icon(
            imageVector = icon,
            contentDescription = contentDescription,
            tint = iconColor
        )
    }
}

@Composable
fun QuickAction(
    icon: ImageVector,
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    isEnabled: Boolean = true,
    backgroundColor: Color = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f),
    iconColor: Color = MaterialTheme.colorScheme.primary
) {
    var isPressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.95f else 1f,
        animationSpec = tween(durationMillis = 100)
    )
    
    Card(
        modifier = modifier
            .scale(scale)
            .clickable { 
                isPressed = true
                if (isEnabled) onClick()
            },
        colors = CardDefaults.cardColors(containerColor = backgroundColor),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = if (isEnabled) iconColor else MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall,
                color = if (isEnabled) MaterialTheme.colorScheme.onSurface 
                       else MaterialTheme.colorScheme.onSurfaceVariant,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
fun ActionChip(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    icon: ImageVector? = null,
    isSelected: Boolean = false,
    isEnabled: Boolean = true
) {
    var isPressed by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.95f else 1f,
        animationSpec = tween(durationMillis = 100)
    )
    
    FilterChip(
        onClick = {
            isPressed = true
            if (isEnabled) onClick()
        },
        label = {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                icon?.let {
                    Icon(
                        imageVector = it,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    
                    Spacer(modifier = Modifier.width(4.dp))
                }
                
                Text(label)
            }
        },
        selected = isSelected,
        enabled = isEnabled,
        modifier = modifier.scale(scale)
    )
}

@Composable
fun SwipeActions(
    onEdit: () -> Unit = {},
    onDelete: () -> Unit = {},
    onView: () -> Unit = {},
    onArchive: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        onView.let {
            SwipeAction(
                icon = Icons.Default.Visibility,
                label = "View",
                backgroundColor = MaterialTheme.colorScheme.primary,
                onClick = onView,
                modifier = Modifier.weight(1f)
            )
        }
        
        onEdit.let {
            SwipeAction(
                icon = Icons.Default.Edit,
                label = "Edit",
                backgroundColor = Color(0xFFFF9800),
                onClick = onEdit,
                modifier = Modifier.weight(1f)
            )
        }
        
        onArchive.let {
            SwipeAction(
                icon = Icons.Default.Archive,
                label = "Archive",
                backgroundColor = Color(0xFF9C27B0),
                onClick = onArchive,
                modifier = Modifier.weight(1f)
            )
        }
        
        onDelete.let {
            SwipeAction(
                icon = Icons.Default.Delete,
                label = "Delete",
                backgroundColor = MaterialTheme.colorScheme.error,
                onClick = onDelete,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
fun OrderActions(
    onView: () -> Unit = {},
    onEdit: () -> Unit = {},
    onComplete: () -> Unit = {},
    onCancel: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        SwipeAction(
            icon = Icons.Default.Visibility,
            label = "View",
            backgroundColor = MaterialTheme.colorScheme.primary,
            onClick = onView,
            modifier = Modifier.weight(1f)
        )
        
        SwipeAction(
            icon = Icons.Default.Edit,
            label = "Edit",
            backgroundColor = Color(0xFFFF9800),
            onClick = onEdit,
            modifier = Modifier.weight(1f)
        )
        
        SwipeAction(
            icon = Icons.Default.Check,
            label = "Complete",
            backgroundColor = Color(0xFF4CAF50),
            onClick = onComplete,
            modifier = Modifier.weight(1f)
        )
        
        SwipeAction(
            icon = Icons.Default.Cancel,
            label = "Cancel",
            backgroundColor = MaterialTheme.colorScheme.error,
            onClick = onCancel,
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
fun AppointmentActions(
    onView: () -> Unit = {},
    onReschedule: () -> Unit = {},
    onComplete: () -> Unit = {},
    onCancel: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        SwipeAction(
            icon = Icons.Default.Visibility,
            label = "View",
            backgroundColor = MaterialTheme.colorScheme.primary,
            onClick = onView,
            modifier = Modifier.weight(1f)
        )
        
        SwipeAction(
            icon = Icons.Default.Schedule,
            label = "Reschedule",
            backgroundColor = Color(0xFFFF9800),
            onClick = onReschedule,
            modifier = Modifier.weight(1f)
        )
        
        SwipeAction(
            icon = Icons.Default.Check,
            label = "Complete",
            backgroundColor = Color(0xFF4CAF50),
            onClick = onComplete,
            modifier = Modifier.weight(1f)
        )
        
        SwipeAction(
            icon = Icons.Default.Cancel,
            label = "Cancel",
            backgroundColor = MaterialTheme.colorScheme.error,
            onClick = onCancel,
            modifier = Modifier.weight(1f)
        )
    }
}

@Composable
fun InventoryActions(
    onView: () -> Unit = {},
    onEdit: () -> Unit = {},
    onRestock: () -> Unit = {},
    onDelete: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        SwipeAction(
            icon = Icons.Default.Visibility,
            label = "View",
            backgroundColor = MaterialTheme.colorScheme.primary,
            onClick = onView,
            modifier = Modifier.weight(1f)
        )
        
        SwipeAction(
            icon = Icons.Default.Edit,
            label = "Edit",
            backgroundColor = Color(0xFFFF9800),
            onClick = onEdit,
            modifier = Modifier.weight(1f)
        )
        
        SwipeAction(
            icon = Icons.Default.Add,
            label = "Restock",
            backgroundColor = Color(0xFF4CAF50),
            onClick = onRestock,
            modifier = Modifier.weight(1f)
        )
        
        SwipeAction(
            icon = Icons.Default.Delete,
            label = "Delete",
            backgroundColor = MaterialTheme.colorScheme.error,
            onClick = onDelete,
            modifier = Modifier.weight(1f)
        )
    }
}

// Enums
enum class ActionButtonType {
    Primary,
    Secondary,
    Outlined,
    Text
}
