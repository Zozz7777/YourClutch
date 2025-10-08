package com.clutch.partners.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

@Composable
fun EmptyState(
    icon: ImageVector = Icons.Default.Inbox,
    title: String,
    description: String,
    actionText: String? = null,
    onAction: (() -> Unit)? = null,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant
        )
        
        Spacer(modifier = Modifier.height(16.dp))
        
        Text(
            text = title,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface,
            textAlign = TextAlign.Center
        )
        
        Spacer(modifier = Modifier.height(8.dp))
        
        Text(
            text = description,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
        
        actionText?.let { text ->
            Spacer(modifier = Modifier.height(24.dp))
            
            Button(
                onClick = { onAction?.invoke() },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(text = text)
            }
        }
    }
}

@Composable
fun EmptyOrdersState(
    onAddOrder: () -> Unit,
    modifier: Modifier = Modifier
) {
    EmptyState(
        icon = Icons.Default.ShoppingCart,
        title = "No Orders Yet",
        description = "When customers place orders, they'll appear here",
        actionText = "Add Order",
        onAction = onAddOrder,
        modifier = modifier
    )
}

@Composable
fun EmptyAppointmentsState(
    onAddAppointment: () -> Unit,
    modifier: Modifier = Modifier
) {
    EmptyState(
        icon = Icons.Default.Schedule,
        title = "No Appointments",
        description = "When customers book appointments, they'll appear here",
        actionText = "Add Appointment",
        onAction = onAddAppointment,
        modifier = modifier
    )
}

@Composable
fun EmptyInventoryState(
    onAddItem: () -> Unit,
    modifier: Modifier = Modifier
) {
    EmptyState(
        icon = Icons.Default.Inventory,
        title = "No Inventory Items",
        description = "Add your first inventory item to get started",
        actionText = "Add Item",
        onAction = onAddItem,
        modifier = modifier
    )
}

@Composable
fun EmptyQuotationsState(
    onCreateQuotation: () -> Unit,
    modifier: Modifier = Modifier
) {
    EmptyState(
        icon = Icons.Default.Description,
        title = "No Quotations",
        description = "Create quotations to send to customers",
        actionText = "Create Quotation",
        onAction = onCreateQuotation,
        modifier = modifier
    )
}

@Composable
fun EmptyNotificationsState(
    modifier: Modifier = Modifier
) {
    EmptyState(
        icon = Icons.Default.Notifications,
        title = "No Notifications",
        description = "You'll receive notifications about orders, payments, and updates here",
        modifier = modifier
    )
}

@Composable
fun EmptySearchState(
    query: String,
    modifier: Modifier = Modifier
) {
    EmptyState(
        icon = Icons.Default.Search,
        title = "No Results Found",
        description = "No items match your search for \"$query\"",
        modifier = modifier
    )
}
