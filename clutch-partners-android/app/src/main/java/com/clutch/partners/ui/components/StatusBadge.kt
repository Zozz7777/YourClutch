package com.clutch.partners.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun StatusBadge(
    text: String,
    color: Color = MaterialTheme.colorScheme.primary,
    backgroundColor: Color = color.copy(alpha = 0.1f),
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .background(
                color = backgroundColor,
                shape = RoundedCornerShape(8.dp)
            )
            .padding(horizontal = 8.dp, vertical = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelSmall,
            color = color,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun OrderStatusBadge(
    status: String,
    modifier: Modifier = Modifier
) {
    val (color, backgroundColor) = when (status.lowercase()) {
        "new", "pending" -> MaterialTheme.colorScheme.primary to MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
        "processing", "in_progress" -> MaterialTheme.colorScheme.tertiary to MaterialTheme.colorScheme.tertiary.copy(alpha = 0.1f)
        "completed", "delivered" -> Color(0xFF4CAF50) to Color(0xFF4CAF50).copy(alpha = 0.1f)
        "cancelled", "rejected" -> Color(0xFFF44336) to Color(0xFFF44336).copy(alpha = 0.1f)
        "paid" -> Color(0xFF4CAF50) to Color(0xFF4CAF50).copy(alpha = 0.1f)
        "pending_payment" -> Color(0xFFFF9800) to Color(0xFFFF9800).copy(alpha = 0.1f)
        else -> MaterialTheme.colorScheme.onSurfaceVariant to MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.1f)
    }
    
    StatusBadge(
        text = status.replace("_", " ").uppercase(),
        color = color,
        backgroundColor = backgroundColor,
        modifier = modifier
    )
}

@Composable
fun AppointmentStatusBadge(
    status: String,
    modifier: Modifier = Modifier
) {
    val (color, backgroundColor) = when (status.lowercase()) {
        "scheduled" -> MaterialTheme.colorScheme.primary to MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
        "confirmed" -> Color(0xFF4CAF50) to Color(0xFF4CAF50).copy(alpha = 0.1f)
        "in_progress" -> Color(0xFFFF9800) to Color(0xFFFF9800).copy(alpha = 0.1f)
        "completed" -> Color(0xFF4CAF50) to Color(0xFF4CAF50).copy(alpha = 0.1f)
        "cancelled" -> Color(0xFFF44336) to Color(0xFFF44336).copy(alpha = 0.1f)
        else -> MaterialTheme.colorScheme.onSurfaceVariant to MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.1f)
    }
    
    StatusBadge(
        text = status.replace("_", " ").uppercase(),
        color = color,
        backgroundColor = backgroundColor,
        modifier = modifier
    )
}

@Composable
fun PaymentStatusBadge(
    status: String,
    modifier: Modifier = Modifier
) {
    val (color, backgroundColor) = when (status.lowercase()) {
        "paid" -> Color(0xFF4CAF50) to Color(0xFF4CAF50).copy(alpha = 0.1f)
        "pending" -> Color(0xFFFF9800) to Color(0xFFFF9800).copy(alpha = 0.1f)
        "failed", "rejected" -> Color(0xFFF44336) to Color(0xFFF44336).copy(alpha = 0.1f)
        "refunded" -> Color(0xFF9C27B0) to Color(0xFF9C27B0).copy(alpha = 0.1f)
        else -> MaterialTheme.colorScheme.onSurfaceVariant to MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.1f)
    }
    
    StatusBadge(
        text = status.replace("_", " ").uppercase(),
        color = color,
        backgroundColor = backgroundColor,
        modifier = modifier
    )
}

@Composable
fun PriorityBadge(
    priority: String,
    modifier: Modifier = Modifier
) {
    val (color, backgroundColor) = when (priority.lowercase()) {
        "high", "urgent" -> Color(0xFFF44336) to Color(0xFFF44336).copy(alpha = 0.1f)
        "normal", "medium" -> Color(0xFFFF9800) to Color(0xFFFF9800).copy(alpha = 0.1f)
        "low" -> Color(0xFF4CAF50) to Color(0xFF4CAF50).copy(alpha = 0.1f)
        else -> MaterialTheme.colorScheme.onSurfaceVariant to MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.1f)
    }
    
    StatusBadge(
        text = priority.replace("_", " ").uppercase(),
        color = color,
        backgroundColor = backgroundColor,
        modifier = modifier
    )
}
