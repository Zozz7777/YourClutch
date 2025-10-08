package com.clutch.partners.ui.screens.main

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import androidx.navigation.compose.currentBackStackEntryAsState
import com.clutch.partners.ClutchPartnersTheme
import com.clutch.partners.navigation.Screen
import com.clutch.partners.viewmodel.MainViewModel
import com.clutch.partners.data.model.Permission
import com.clutch.partners.data.model.PartnerType
import com.clutch.partners.ui.components.PermissionGate
import com.clutch.partners.ui.components.DynamicBottomNavigation
import com.clutch.partners.ui.components.MoreMenuScreen

@Composable
fun MainScreen(
    navController: NavController,
    viewModel: MainViewModel = hiltViewModel()
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route
    val partnerType by viewModel.partnerType.collectAsState()
    
    ClutchPartnersTheme {
        Scaffold(
            bottomBar = {
                if (currentRoute != Screen.More.route) {
                    DynamicBottomNavigation(
                        currentRoute = currentRoute ?: "",
                        onNavigate = { route -> navController.navigate(route) },
                        partnerType = partnerType
                    )
                }
            }
        ) { paddingValues ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                when (currentRoute) {
                    // Home/Dashboard screens
                    Screen.Home.route -> HomeScreen(navController)
                    Screen.Dashboard.route -> DashboardScreen(navController)
                    
                    // Partner-type specific screens
                    Screen.Orders.route -> OrdersScreen(navController)
                    Screen.Appointments.route -> AppointmentsScreen(navController)
                    Screen.Quotations.route -> QuotationsScreen(navController)
                    Screen.Inventory.route -> InventoryScreen(navController)
                    
                    // Common screens
                    Screen.Payments.route -> PaymentsScreen(navController)
                    Screen.MyStore.route -> MyStoreScreen(navController)
                    Screen.More.route -> MoreMenuScreen(
                        onNavigate = { route -> navController.navigate(route) },
                        onBack = { navController.popBackStack() }
                    )
                    
                    // Legacy screens for backward compatibility
                    Screen.POS.route -> com.clutch.partners.ui.screens.pos.POSScreen(navController)
                    Screen.Settings.route -> SettingsScreen(navController)
                }
            }
        }
    }
}

@Composable
fun BottomNavigationBar(
    currentRoute: String?,
    onNavigate: (String) -> Unit
) {
    val allItems = listOf(
        BottomNavItem("Home", Screen.Home.route, Icons.Default.Home, Permission.VIEW_DASHBOARD),
        BottomNavItem("Dashboard", Screen.Dashboard.route, Icons.Default.Dashboard, Permission.VIEW_DASHBOARD),
        BottomNavItem("POS", Screen.POS.route, Icons.Default.PointOfSale, Permission.MANAGE_ORDERS),
        BottomNavItem("Payments", Screen.Payments.route, Icons.Default.Payment, Permission.VIEW_PAYMENTS),
        BottomNavItem("Settings", Screen.Settings.route, Icons.Default.Settings, Permission.VIEW_SETTINGS)
    )
    
    // Filter items based on permissions
    val items = allItems.filter { item ->
        // For now, show all items - in real app, this would check permissions
        true
    }
    
    NavigationBar {
        items.forEach { item ->
            NavigationBarItem(
                icon = { Icon(item.icon, contentDescription = item.label) },
                label = { Text(item.label) },
                selected = currentRoute == item.route,
                onClick = { onNavigate(item.route) }
            )
        }
    }
}

data class BottomNavItem(
    val label: String,
    val route: String,
    val icon: ImageVector,
    val requiredPermission: Permission
)
