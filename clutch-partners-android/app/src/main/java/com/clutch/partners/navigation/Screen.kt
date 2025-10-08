package com.clutch.partners.navigation

sealed class Screen(val route: String) {
    // Auth Screens (KEEP AS-IS - DON'T TOUCH)
    object Splash : Screen("splash")
    object Onboarding : Screen("onboarding")
    object PartnerTypeSelector : Screen("partner_type_selector")
    object Auth : Screen("auth")
    object SignIn : Screen("sign_in")
    object SignUp : Screen("sign_up")
    object RequestToJoin : Screen("request_to_join")
    object ForgotPassword : Screen("forgot_password")
    object KYC : Screen("kyc")
    
    // Approval Screens
    object PendingApprovals : Screen("pending_approvals")
    object MyApprovalRequests : Screen("my_approval_requests")
    
    // Main Navigation (4-Item Bottom Nav)
    object Main : Screen("main")
    object Home : Screen("home")
    object Payments : Screen("payments")
    object MyStore : Screen("my_store")
    object More : Screen("more")
    
    // Home Screen Variants (Partner-Type Specific)
    object Orders : Screen("orders")
    object Appointments : Screen("appointments")
    object Quotations : Screen("quotations")
    object Inventory : Screen("inventory")
    
    // Detail Screens
    object OrderDetails : Screen("order_details/{orderId}") {
        fun createRoute(orderId: String) = "order_details/$orderId"
    }
    object AppointmentDetails : Screen("appointment_details/{appointmentId}") {
        fun createRoute(appointmentId: String) = "appointment_details/$appointmentId"
    }
    object QuotationDetails : Screen("quotation_details/{quotationId}") {
        fun createRoute(quotationId: String) = "quotation_details/$quotationId"
    }
    object InventoryItemDetails : Screen("inventory_item/{itemId}") {
        fun createRoute(itemId: String) = "inventory_item/$itemId"
    }
    
    // Create/Edit Screens
    object CreateOrder : Screen("create_order")
    object CreateAppointment : Screen("create_appointment")
    object CreateQuotation : Screen("create_quotation")
    object AddInventoryItem : Screen("add_inventory_item")
    object EditInventoryItem : Screen("edit_inventory_item/{itemId}") {
        fun createRoute(itemId: String) = "edit_inventory_item/$itemId"
    }
    
    // My Store Screens
    object StoreProfile : Screen("store_profile")
    object StoreSettings : Screen("store_settings")
    object BusinessDashboard : Screen("business_dashboard")
    object WorkingHours : Screen("working_hours")
    object Services : Screen("services")
    
    // More Menu Screens
    object Notifications : Screen("notifications")
    object Support : Screen("support")
    object AuditLog : Screen("audit_log")
    object Warranty : Screen("warranty")
    object Disputes : Screen("disputes")
    object Export : Screen("export")
    object Language : Screen("language")
    object Theme : Screen("theme")
    object About : Screen("about")
    
    // Support System
    object CreateTicket : Screen("create_ticket")
    object TicketDetails : Screen("ticket_details/{ticketId}") {
        fun createRoute(ticketId: String) = "ticket_details/$ticketId"
    }
    object SubmitDispute : Screen("submit_dispute/{invoiceId}") {
        fun createRoute(invoiceId: String) = "submit_dispute/$invoiceId"
    }
    object DisputeDetails : Screen("dispute_details/{disputeId}") {
        fun createRoute(disputeId: String) = "dispute_details/$disputeId"
    }
    
    // Invoice System
    object InvoiceEditor : Screen("invoice_editor/{orderId}") {
        fun createRoute(orderId: String) = "invoice_editor/$orderId"
    }
    object InvoiceViewer : Screen("invoice_viewer/{invoiceId}") {
        fun createRoute(invoiceId: String) = "invoice_viewer/$invoiceId"
    }
    
    // Legacy Screens (for backward compatibility)
    object Dashboard : Screen("dashboard")
    object Settings : Screen("settings")
    object Loyalty : Screen("loyalty")
    object Ratings : Screen("ratings")
    object POS : Screen("pos")
    object PurchaseOrders : Screen("purchase_orders")
    object Suppliers : Screen("suppliers")
    object Devices : Screen("devices")
    object Staff : Screen("staff")
    object Contracts : Screen("contracts")
    object Reports : Screen("reports")
    object Vehicles : Screen("vehicles")
    object Quotes : Screen("quotes")
    object Promotions : Screen("promotions")
    object Feedback : Screen("feedback")
    object Catalog : Screen("catalog")
    object Training : Screen("training")
}
