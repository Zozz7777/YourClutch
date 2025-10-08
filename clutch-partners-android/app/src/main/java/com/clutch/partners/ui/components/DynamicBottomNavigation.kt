package com.clutch.partners.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.clutch.partners.data.model.PartnerType
import com.clutch.partners.navigation.Screen

@Composable
fun DynamicBottomNavigation(
    currentRoute: String,
    onNavigate: (String) -> Unit,
    partnerType: PartnerType,
    modifier: Modifier = Modifier
) {
    val navigationItems = getNavigationItemsForPartnerType(partnerType)
    
    NavigationBar(
        modifier = modifier,
        containerColor = MaterialTheme.colorScheme.surface,
        contentColor = MaterialTheme.colorScheme.onSurface
    ) {
        navigationItems.forEach { item ->
            NavigationBarItem(
                icon = {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = item.label
                    )
                },
                label = {
                    Text(
                        text = item.label,
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = if (currentRoute == item.route) FontWeight.Bold else FontWeight.Normal
                    )
                },
                selected = currentRoute == item.route,
                onClick = { onNavigate(item.route) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = MaterialTheme.colorScheme.primary,
                    selectedTextColor = MaterialTheme.colorScheme.primary,
                    unselectedIconColor = MaterialTheme.colorScheme.onSurfaceVariant,
                    unselectedTextColor = MaterialTheme.colorScheme.onSurfaceVariant
                )
            )
        }
    }
}

@Composable
fun MoreMenuScreen(
    onNavigate: (String) -> Unit,
    onBack: () -> Unit
) {
    val moreMenuItems = listOf(
        MoreMenuItem(
            icon = Icons.Default.Notifications,
            label = "Notifications",
            route = Screen.Notifications.route
        ),
        MoreMenuItem(
            icon = Icons.Default.Support,
            label = "Support",
            route = Screen.Support.route
        ),
        MoreMenuItem(
            icon = Icons.Default.Assignment,
            label = "Audit Log",
            route = Screen.AuditLog.route
        ),
        MoreMenuItem(
            icon = Icons.Default.Security,
            label = "Warranty & Disputes",
            route = Screen.Warranty.route
        ),
        MoreMenuItem(
            icon = Icons.Default.Download,
            label = "Export Data",
            route = Screen.Export.route
        ),
        MoreMenuItem(
            icon = Icons.Default.Language,
            label = "Language",
            route = Screen.Language.route
        ),
        MoreMenuItem(
            icon = Icons.Default.Palette,
            label = "Theme",
            route = Screen.Theme.route
        ),
        MoreMenuItem(
            icon = Icons.Default.Info,
            label = "About & Help",
            route = Screen.About.route
        )
    )
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
    ) {
        // Top App Bar
        TopAppBar(
            title = { Text("More") },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                }
            }
        )
        
        // Menu Items
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(moreMenuItems) { item ->
                MoreMenuItemCard(
                    item = item,
                    onClick = { onNavigate(item.route) }
                )
            }
        }
    }
}

@Composable
fun MoreMenuItemCard(
    item: MoreMenuItem,
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
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.width(16.dp))
            
            Text(
                text = item.label,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onSurface
            )
            
            Spacer(modifier = Modifier.weight(1f))
            
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

private fun getNavigationItemsForPartnerType(partnerType: PartnerType): List<NavigationItem> {
    return when (partnerType) {
        PartnerType.REPAIR_CENTER, PartnerType.SERVICE_CENTER -> {
            listOf(
                NavigationItem(
                    icon = Icons.Default.Schedule,
                    label = "Appointments",
                    route = Screen.Appointments.route
                ),
                NavigationItem(
                    icon = Icons.Default.AttachMoney,
                    label = "Payments",
                    route = Screen.Payments.route
                ),
                NavigationItem(
                    icon = Icons.Default.Store,
                    label = "My Store",
                    route = Screen.MyStore.route
                ),
                NavigationItem(
                    icon = Icons.Default.MoreHoriz,
                    label = "More",
                    route = Screen.More.route
                )
            )
        }
        PartnerType.AUTO_PARTS_SHOP, PartnerType.ACCESSORIES_SHOP, PartnerType.IMPORTER_MANUFACTURER -> {
            listOf(
                NavigationItem(
                    icon = Icons.Default.ShoppingCart,
                    label = "Orders",
                    route = Screen.Orders.route
                ),
                NavigationItem(
                    icon = Icons.Default.AttachMoney,
                    label = "Payments",
                    route = Screen.Payments.route
                ),
                NavigationItem(
                    icon = Icons.Default.Store,
                    label = "My Store",
                    route = Screen.MyStore.route
                ),
                NavigationItem(
                    icon = Icons.Default.MoreHoriz,
                    label = "More",
                    route = Screen.More.route
                )
            )
        }
        else -> {
            // Default navigation for unknown partner types
            listOf(
                NavigationItem(
                    icon = Icons.Default.Home,
                    label = "Home",
                    route = Screen.Home.route
                ),
                NavigationItem(
                    icon = Icons.Default.AttachMoney,
                    label = "Payments",
                    route = Screen.Payments.route
                ),
                NavigationItem(
                    icon = Icons.Default.Store,
                    label = "My Store",
                    route = Screen.MyStore.route
                ),
                NavigationItem(
                    icon = Icons.Default.MoreHoriz,
                    label = "More",
                    route = Screen.More.route
                )
            )
        }
    }
}

data class NavigationItem(
    val icon: ImageVector,
    val label: String,
    val route: String
)

data class MoreMenuItem(
    val icon: ImageVector,
    val label: String,
    val route: String
)
