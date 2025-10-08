package com.clutch.partners.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navDeepLink
import com.clutch.partners.ui.screens.auth.*
import com.clutch.partners.ui.screens.main.*
import com.clutch.partners.ui.screens.advanced.*
import com.clutch.partners.ui.screens.customer.*
import com.clutch.partners.ui.screens.growth.*
import com.clutch.partners.ui.screens.pos.*

@Composable
fun NavigationHost(
    navController: NavHostController,
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route,
        modifier = modifier
    ) {
        // Auth Screens
        composable(Screen.Splash.route) { SplashScreen(navController) }
        composable(Screen.Onboarding.route) { OnboardingScreen(navController) }
        composable(Screen.PartnerTypeSelector.route) { PartnerTypeSelectorScreen(navController) }
        composable(Screen.Auth.route) { AuthScreen(navController) }
        composable(Screen.SignIn.route) { SignInScreen(navController) }
        composable(Screen.SignUp.route) { SignUpScreen(navController) }
        composable(Screen.RequestToJoin.route) { RequestToJoinScreen(navController) }
        composable(Screen.ForgotPassword.route) { ForgotPasswordScreen(navController) }
        composable(Screen.KYC.route) { KYCScreen(navController) }

        // Main Screens
        composable(Screen.Main.route) { MainScreen(navController) }
        composable(Screen.Home.route) { HomeScreen(navController) }
        composable(Screen.Dashboard.route) { DashboardScreen(navController) }
        composable(Screen.Payments.route) { PaymentsScreen(navController) }
        composable(Screen.Settings.route) { SettingsScreen(navController) }
        composable(Screen.Loyalty.route) { LoyaltyScreen(navController) }
        composable(Screen.Ratings.route) { RatingsScreen(navController) }
        composable(Screen.Notifications.route) { NotificationsScreen(navController) }
        composable(Screen.Support.route) { SupportScreen(navController) }
        composable(Screen.Audit.route) { AuditScreen(navController) }
        composable(Screen.Warranty.route) { WarrantyScreen(navController) }
        composable(Screen.Export.route) { ExportScreen(navController) }
        
        // Partner-type specific screens
        composable(Screen.Orders.route) { OrdersScreen(navController) }
        composable(Screen.Appointments.route) { AppointmentsScreen(navController) }
        composable(Screen.Quotations.route) { QuotationsScreen(navController) }
        composable(Screen.Inventory.route) { InventoryScreen(navController) }
        composable(Screen.MyStore.route) { MyStoreScreen(navController) }
        composable(Screen.More.route) { MoreMenuScreen(
            onNavigate = { route -> navController.navigate(route) },
            onBack = { navController.popBackStack() }
        ) }

        // Advanced Screens
        composable(Screen.POS.route) { POSScreen(navController) }
        composable(Screen.PurchaseOrders.route) { PurchaseOrdersScreen(navController) }
        composable(Screen.Suppliers.route) { SuppliersScreen(navController) }
        composable(Screen.Devices.route) { DevicesScreen(navController) }
        composable(Screen.Staff.route) { StaffScreen(navController) }
        composable(Screen.Contracts.route) { ContractsScreen(navController) }
        composable(Screen.Reports.route) { ReportsScreen(navController) }

        // Customer Screens
        composable(Screen.Appointments.route) { AppointmentsScreen(navController) }
        composable(Screen.Vehicles.route) { VehiclesScreen(navController) }
        composable(Screen.Quotes.route) { QuotesScreen(navController) }
        composable(Screen.Promotions.route) { PromotionsScreen(navController) }
        composable(Screen.Feedback.route) { FeedbackScreen(navController) }

        // Growth Screens
        composable(Screen.Catalog.route) { CatalogScreen(navController) }
        composable(Screen.Training.route) { TrainingScreen(navController) }
    }
}
