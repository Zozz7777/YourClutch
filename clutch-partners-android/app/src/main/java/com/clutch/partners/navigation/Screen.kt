package com.clutch.partners.navigation

sealed class Screen(val route: String) {
    // Auth Screens
    object Splash : Screen("splash")
    object Onboarding : Screen("onboarding")
    object PartnerTypeSelector : Screen("partner_type_selector")
    object Auth : Screen("auth")
    object SignIn : Screen("sign_in")
    object SignUp : Screen("sign_up")
    object RequestToJoin : Screen("request_to_join")
    object ForgotPassword : Screen("forgot_password")
    object KYC : Screen("kyc")
    
    // Main Screens
    object Main : Screen("main")
    object Home : Screen("home")
    object Dashboard : Screen("dashboard")
    object Payments : Screen("payments")
    object Settings : Screen("settings")
    object Loyalty : Screen("loyalty")
    object Ratings : Screen("ratings")
    object Notifications : Screen("notifications")
    object Support : Screen("support")
    object Audit : Screen("audit")
    object Warranty : Screen("warranty")
    object Export : Screen("export")
    
    // Advanced Screens
    object POS : Screen("pos")
    object Inventory : Screen("inventory")
    object PurchaseOrders : Screen("purchase_orders")
    object Suppliers : Screen("suppliers")
    object Devices : Screen("devices")
    object Staff : Screen("staff")
    object Contracts : Screen("contracts")
    object Reports : Screen("reports")
    
    // Customer Screens
    object Appointments : Screen("appointments")
    object Vehicles : Screen("vehicles")
    object Quotes : Screen("quotes")
    object Promotions : Screen("promotions")
    object Feedback : Screen("feedback")
    
    // Growth Screens
    object Catalog : Screen("catalog")
    object Training : Screen("training")
}
