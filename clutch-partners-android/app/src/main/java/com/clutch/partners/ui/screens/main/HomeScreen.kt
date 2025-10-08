package com.clutch.partners.ui.screens.main

import androidx.compose.foundation.background
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.clutch.partners.ClutchPartnersTheme
import com.clutch.partners.data.model.*
import com.clutch.partners.navigation.Screen
import com.clutch.partners.ui.components.*
import com.clutch.partners.viewmodel.MainViewModel
import com.clutch.partners.viewmodel.AppointmentsViewModel
import com.clutch.partners.viewmodel.QuotationsViewModel
import com.clutch.partners.viewmodel.InventoryViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    navController: NavController,
    mainViewModel: MainViewModel = hiltViewModel(),
    appointmentsViewModel: AppointmentsViewModel = hiltViewModel(),
    quotationsViewModel: QuotationsViewModel = hiltViewModel(),
    inventoryViewModel: InventoryViewModel = hiltViewModel()
) {
    val mainUiState by mainViewModel.uiState.collectAsState()
    val appointmentsUiState by appointmentsViewModel.uiState.collectAsState()
    val quotationsUiState by quotationsViewModel.uiState.collectAsState()
    val inventoryUiState by inventoryViewModel.uiState.collectAsState()
    
    // Determine partner type and show appropriate content
    val partnerType = mainUiState.user?.businessType ?: PartnerType.REPAIR_CENTER
    
    LaunchedEffect(Unit) {
        when (partnerType) {
            PartnerType.REPAIR_CENTER, PartnerType.SERVICE_CENTER -> {
                appointmentsViewModel.loadAppointments()
            }
            PartnerType.AUTO_PARTS_SHOP, PartnerType.ACCESSORIES_SHOP, PartnerType.IMPORTER_MANUFACTURER -> {
                mainViewModel.loadOrders()
                inventoryViewModel.loadInventory()
            }
        }
        quotationsViewModel.loadQuotations()
    }
    
    ClutchPartnersTheme {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(MaterialTheme.colorScheme.background)
        ) {
            // Top App Bar
            TopAppBar(
                title = { 
                    Text(
                        text = when (partnerType) {
                            PartnerType.REPAIR_CENTER, PartnerType.SERVICE_CENTER -> "Appointments"
                            else -> "Orders"
                        }
                    )
                },
                actions = {
                    IconButton(onClick = { navController.navigate(Screen.Notifications.route) }) {
                        Icon(Icons.Default.Notifications, contentDescription = "Notifications")
                    }
                }
            )
            
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Quick Stats Section
                item {
                    QuickStatsSection(
                        partnerType = partnerType,
                        mainUiState = mainUiState,
                        appointmentsUiState = appointmentsUiState,
                        quotationsUiState = quotationsUiState,
                        inventoryUiState = inventoryUiState,
                        onNavigateToPayments = { navController.navigate(Screen.Payments.route) },
                        onNavigateToInventory = { navController.navigate(Screen.Inventory.route) }
                    )
                }
                
                // Main Content based on partner type
                when (partnerType) {
                    PartnerType.REPAIR_CENTER, PartnerType.SERVICE_CENTER -> {
                        // Appointments Section
                        item {
                            AppointmentsSection(
                                appointmentsUiState = appointmentsUiState,
                                onAppointmentClick = { appointmentId ->
                                    navController.navigate("appointment_details/$appointmentId")
                                },
                                onAddAppointment = {
                                    navController.navigate(Screen.Appointments.route)
                                }
                            )
                        }
                    }
                    else -> {
                        // Orders Section
                        item {
                            OrdersSection(
                                mainUiState = mainUiState,
                                onOrderClick = { orderId ->
                                    navController.navigate("order_details/$orderId")
                                }
                            )
                        }
                    }
                }
                
                // Quotations Section (for all partner types)
                item {
                    QuotationsSection(
                        quotationsUiState = quotationsUiState,
                        onQuotationClick = { quotationId ->
                            navController.navigate("quotation_details/$quotationId")
                        },
                        onCreateQuotation = {
                            navController.navigate(Screen.Quotations.route)
                        }
                    )
                }
                
                // Inventory Section (for parts shops)
                if (partnerType == PartnerType.AUTO_PARTS_SHOP || 
                    partnerType == PartnerType.ACCESSORIES_SHOP || 
                    partnerType == PartnerType.IMPORTER_MANUFACTURER) {
                    item {
                        InventorySection(
                            inventoryUiState = inventoryUiState,
                            onItemClick = { itemId ->
                                navController.navigate("inventory_item/$itemId")
                            },
                            onManageInventory = {
                                navController.navigate(Screen.Inventory.route)
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun QuickStatsSection(
    partnerType: PartnerType,
    mainUiState: com.clutch.partners.viewmodel.MainUiState,
    appointmentsUiState: com.clutch.partners.viewmodel.AppointmentsUiState,
    quotationsUiState: com.clutch.partners.viewmodel.QuotationsUiState,
    inventoryUiState: com.clutch.partners.viewmodel.InventoryUiState,
    onNavigateToPayments: () -> Unit,
    onNavigateToInventory: () -> Unit
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Today's Overview",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground
        )
        
        when (partnerType) {
            PartnerType.REPAIR_CENTER, PartnerType.SERVICE_CENTER -> {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard(
                        title = "Today's Appointments",
                        value = appointmentsUiState.appointments.count { 
                            it.scheduledDate.toLocalDate() == java.time.LocalDate.now() 
                        }.toString(),
                        icon = Icons.Default.Schedule,
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = "Pending Quotations",
                        value = quotationsUiState.quotations.count { it.status == QuotationStatus.PENDING }.toString(),
                        icon = Icons.Default.Description,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            else -> {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    StatCard(
                        title = "Today's Orders",
                        value = mainUiState.orders.count { 
                            it.createdAt.toLocalDate() == java.time.LocalDate.now() 
                        }.toString(),
                        icon = Icons.Default.ShoppingCart,
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = "Low Stock Items",
                        value = inventoryUiState.inventory.count { it.isLowStock }.toString(),
                        icon = Icons.Default.Warning,
                        iconTint = Color(0xFFFF9800),
                        modifier = Modifier.weight(1f),
                        onClick = onNavigateToInventory
                    )
                }
            }
        }
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            StatCard(
                title = "Weekly Revenue",
                value = "EGP 5,420",
                subtitle = "+12% vs last week",
                icon = Icons.Default.AttachMoney,
                iconTint = Color(0xFF4CAF50),
                modifier = Modifier.weight(1f),
                onClick = onNavigateToPayments
            )
            StatCard(
                title = "Active Quotations",
                value = quotationsUiState.quotations.count { it.status == QuotationStatus.PENDING }.toString(),
                icon = Icons.Default.Description,
                modifier = Modifier.weight(1f)
            )
        }
    }
}

@Composable
fun AppointmentsSection(
    appointmentsUiState: com.clutch.partners.viewmodel.AppointmentsUiState,
    onAppointmentClick: (String) -> Unit,
    onAddAppointment: () -> Unit
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Today's Appointments",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )
            
            TextButton(onClick = onAddAppointment) {
                Text("Add")
            }
        }
        
        if (appointmentsUiState.isLoading) {
            SkeletonList(itemCount = 3)
        } else if (appointmentsUiState.appointments.isEmpty()) {
            EmptyAppointmentsState(onAddAppointment = onAddAppointment)
        } else {
            appointmentsUiState.appointments.take(5).forEach { appointment ->
                AppointmentCard(
                    appointment = appointment,
                    onClick = { onAppointmentClick(appointment.id) }
                )
            }
        }
    }
}

@Composable
fun OrdersSection(
    mainUiState: com.clutch.partners.viewmodel.MainUiState,
    onOrderClick: (String) -> Unit
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = "Recent Orders",
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground
        )
        
        if (mainUiState.isLoading) {
            SkeletonList(itemCount = 3)
        } else if (mainUiState.orders.isEmpty()) {
            EmptyOrdersState(onAddOrder = { /* Navigate to add order */ })
        } else {
            mainUiState.orders.take(5).forEach { order ->
                OrderCard(
                    order = order,
                    onClick = { onOrderClick(order.id) }
                )
            }
        }
    }
}

@Composable
fun QuotationsSection(
    quotationsUiState: com.clutch.partners.viewmodel.QuotationsUiState,
    onQuotationClick: (String) -> Unit,
    onCreateQuotation: () -> Unit
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Recent Quotations",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )
            
            TextButton(onClick = onCreateQuotation) {
                Text("Create")
            }
        }
        
        if (quotationsUiState.isLoading) {
            SkeletonList(itemCount = 2)
        } else if (quotationsUiState.quotations.isEmpty()) {
            EmptyQuotationsState(onCreateQuotation = onCreateQuotation)
        } else {
            quotationsUiState.quotations.take(3).forEach { quotation ->
                QuotationCard(
                    quotation = quotation,
                    onClick = { onQuotationClick(quotation.id) }
                )
            }
        }
    }
}

@Composable
fun InventorySection(
    inventoryUiState: com.clutch.partners.viewmodel.InventoryUiState,
    onItemClick: (String) -> Unit,
    onManageInventory: () -> Unit
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Inventory Alerts",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )
            
            TextButton(onClick = onManageInventory) {
                Text("Manage")
            }
        }
        
        if (inventoryUiState.isLoading) {
            SkeletonList(itemCount = 2)
        } else if (inventoryUiState.inventory.isEmpty()) {
            EmptyInventoryState(onAddItem = { /* Navigate to add item */ })
        } else {
            val lowStockItems = inventoryUiState.inventory.filter { it.isLowStock }.take(3)
            if (lowStockItems.isEmpty()) {
                Text(
                    text = "All items are well stocked!",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {
                lowStockItems.forEach { item ->
                    InventoryItemCard(
                        item = item,
                        onClick = { onItemClick(item.id) }
                    )
                }
            }
        }
    }
}

@Composable
fun AppointmentCard(
    appointment: Appointment,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = appointment.customer.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                AppointmentStatusBadge(
                    status = appointment.status.name,
                    modifier = Modifier
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = appointment.service,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = "Scheduled: ${appointment.scheduledDate}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun QuotationCard(
    quotation: Quotation,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Quote #${quotation.quotationId}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Text(
                    text = "EGP ${quotation.total}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = quotation.customer.name,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                StatusBadge(
                    text = quotation.status.name,
                    color = when (quotation.status) {
                        QuotationStatus.PENDING -> Color(0xFFFF9800)
                        QuotationStatus.ACCEPTED -> Color(0xFF4CAF50)
                        QuotationStatus.REJECTED -> Color(0xFFF44336)
                        QuotationStatus.EXPIRED -> Color(0xFF9E9E9E)
                        else -> MaterialTheme.colorScheme.outline
                    }
                )
                
                if (quotation.isExpired) {
                    StatusBadge(
                        text = "EXPIRED",
                        color = Color(0xFF9E9E9E)
                    )
                }
            }
        }
    }
}

@Composable
fun InventoryItemCard(
    item: InventoryItem,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = item.name,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                StatusBadge(
                    text = if (item.isOutOfStock) "OUT OF STOCK" else "LOW STOCK",
                    color = if (item.isOutOfStock) Color(0xFFF44336) else Color(0xFFFF9800)
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "Stock: ${item.stock} units",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = "Price: EGP ${item.price}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun OrderCard(
    order: Order,
    onClick: () -> Unit
) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Order #${order.id}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurface
                )
                
                Text(
                    text = "EGP ${order.totalAmount}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = order.customerName,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f)
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OrderStatusBadge(
                    status = order.status.name,
                    modifier = Modifier
                )
                PaymentStatusBadge(
                    status = order.paymentStatus.name,
                    modifier = Modifier
                )
            }
        }
    }
}

