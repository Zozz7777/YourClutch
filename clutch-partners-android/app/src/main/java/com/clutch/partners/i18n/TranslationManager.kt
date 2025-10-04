package com.clutch.partners.i18n

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import com.clutch.partners.utils.LanguageManager

object TranslationManager {
    private var currentLanguage: String = "ar"
    
    fun setLanguage(language: String) {
        currentLanguage = language
    }
    
    fun getCurrentLanguage(): String = currentLanguage
    
    @Composable
    fun getString(key: String): String {
        val context = LocalContext.current
        val language = LanguageManager.getSupportedLanguage(context)
        return getStringForLanguage(key, language)
    }
    
    fun getStringForLanguage(key: String, language: String): String {
        return when (language) {
            "ar" -> ArabicTranslations.getString(key)
            "en" -> EnglishTranslations.getString(key)
            else -> ArabicTranslations.getString(key) // Default to Arabic
        }
    }
}

object ArabicTranslations {
    fun getString(key: String): String {
        return translations[key] ?: key
    }
    
    private val translations = mapOf(
        // Common
        "app_name" to "Clutch Partners",
        "loading" to "جاري التحميل...",
        "error" to "خطأ",
        "success" to "نجح",
        "cancel" to "إلغاء",
        "save" to "حفظ",
        "delete" to "حذف",
        "edit" to "تعديل",
        "add" to "إضافة",
        "search" to "بحث",
        "filter" to "تصفية",
        "sort" to "ترتيب",
        "refresh" to "تحديث",
        "back" to "رجوع",
        "next" to "التالي",
        "previous" to "السابق",
        "done" to "تم",
        "close" to "إغلاق",
        "ok" to "موافق",
        "yes" to "نعم",
        "no" to "لا",
        
        // Navigation
        "nav_home" to "الرئيسية",
        "nav_dashboard" to "لوحة التحكم",
        "nav_payments" to "المدفوعات",
        "nav_notifications" to "الإشعارات",
        "nav_support" to "الدعم",
        "nav_audit" to "سجل التدقيق",
        "nav_warranty" to "الضمان",
        "nav_export" to "التصدير",
        "nav_settings" to "الإعدادات",
        
        // Authentication
        "auth_sign_in" to "تسجيل الدخول",
        "auth_sign_up" to "إنشاء حساب",
        "auth_request_join" to "طلب الانضمام",
        "auth_email" to "البريد الإلكتروني",
        "auth_password" to "كلمة المرور",
        "auth_phone" to "رقم الهاتف",
        "auth_partner_id" to "رقم الشريك",
        "auth_business_name" to "اسم العمل",
        "auth_owner_name" to "اسم المالك",
        "auth_business_address" to "عنوان العمل",
        "auth_forgot_password" to "نسيت كلمة المرور؟",
        "auth_remember_me" to "تذكرني",
        
        // Onboarding
        "onboarding_title_1" to "إدارة متجرك",
        "onboarding_desc_1" to "إدارة طلباتك ومخزونك بسهولة",
        "onboarding_title_2" to "استقبال طلبات Clutch",
        "onboarding_desc_2" to "استقبال وإدارة طلبات العملاء",
        "onboarding_title_3" to "تتبع المدفوعات",
        "onboarding_desc_3" to "مراقبة إيراداتك ومدفوعاتك",
        "onboarding_get_started" to "ابدأ الآن",
        "onboarding_skip" to "تخطي",
        
        // Partner Types
        "partner_type_repair_center" to "مركز إصلاح",
        "partner_type_auto_parts" to "متجر قطع غيار",
        "partner_type_accessories" to "متجر إكسسوارات",
        "partner_type_importer" to "مستورد",
        "partner_type_manufacturer" to "مصنع",
        "partner_type_service_center" to "مركز خدمة",
        
        // KYC
        "kyc_title" to "التحقق من الهوية",
        "kyc_upload_documents" to "رفع المستندات",
        "kyc_vat_certificate" to "شهادة ضريبة القيمة المضافة",
        "kyc_trade_license" to "رخصة تجارية",
        "kyc_owner_id" to "هوية المالك",
        "kyc_status_pending" to "في الانتظار",
        "kyc_status_approved" to "موافق عليه",
        "kyc_status_rejected" to "مرفوض",
        
        // Home
        "home_orders" to "الطلبات",
        "home_appointments" to "المواعيد",
        "home_recent_orders" to "الطلبات الأخيرة",
        "home_today_orders" to "طلبات اليوم",
        "home_pending_orders" to "الطلبات المعلقة",
        "home_completed_orders" to "الطلبات المكتملة",
        
        // Dashboard
        "dashboard_revenue_overview" to "نظرة عامة على الإيرادات",
        "dashboard_today_revenue" to "إيرادات اليوم",
        "dashboard_weekly_revenue" to "الإيرادات الأسبوعية",
        "dashboard_monthly_revenue" to "الإيرادات الشهرية",
        "dashboard_revenue_trend" to "اتجاه الإيرادات",
        "dashboard_orders" to "الطلبات",
        "dashboard_completed" to "مكتملة",
        "dashboard_in_progress" to "قيد التنفيذ",
        "dashboard_pending" to "معلقة",
        "dashboard_inventory_overview" to "نظرة عامة على المخزون",
        "dashboard_total_products" to "إجمالي المنتجات",
        "dashboard_low_stock" to "منخفض المخزون",
        "dashboard_out_of_stock" to "نفد المخزون",
        
        // Payments
        "payments_weekly_income" to "الدخل الأسبوعي",
        "payments_payout_countdown" to "عد تنازلي للدفع",
        "payments_payment_history" to "تاريخ المدفوعات",
        "payments_total_earnings" to "إجمالي الأرباح",
        "payments_pending_payouts" to "المدفوعات المعلقة",
        "payments_completed_payouts" to "المدفوعات المكتملة",
        
        // Notifications
        "notifications_title" to "الإشعارات",
        "notifications_mark_all_read" to "تحديد الكل كمقروء",
        "notifications_new_order" to "طلب جديد",
        "notifications_payment_received" to "دفعة مستلمة",
        "notifications_system_update" to "تحديث النظام",
        "notifications_new_appointment" to "موعد جديد",
        "notifications_inventory_alert" to "تنبيه مخزون",
        
        // Support
        "support_title" to "الدعم الفني",
        "support_tickets" to "التذاكر",
        "support_live_chat" to "الدردشة المباشرة",
        "support_faq" to "الأسئلة الشائعة",
        "support_create_ticket" to "إنشاء تذكرة جديدة",
        "support_ticket_title" to "عنوان التذكرة",
        "support_ticket_description" to "وصف التذكرة",
        "support_ticket_priority" to "أولوية التذكرة",
        "support_priority_low" to "منخفض",
        "support_priority_medium" to "متوسط",
        "support_priority_high" to "عالي",
        "support_status_open" to "مفتوح",
        "support_status_in_progress" to "قيد التنفيذ",
        "support_status_closed" to "مغلق",
        
        // Audit Log
        "audit_title" to "سجل التدقيق",
        "audit_export_logs" to "تصدير السجلات",
        "audit_refresh" to "تحديث",
        "audit_filter_all" to "الكل",
        "audit_filter_orders" to "الطلبات",
        "audit_filter_payments" to "المدفوعات",
        "audit_filter_inventory" to "المخزون",
        "audit_filter_settings" to "الإعدادات",
        "audit_filter_security" to "الأمان",
        "audit_severity_info" to "معلومات",
        "audit_severity_success" to "نجح",
        "audit_severity_warning" to "تحذير",
        "audit_severity_error" to "خطأ",
        
        // Warranty & Disputes
        "warranty_title" to "الضمان والنزاعات",
        "warranty_claims" to "مطالبات الضمان",
        "warranty_disputes" to "النزاعات",
        "warranty_escalations" to "التصعيد",
        "warranty_new_claim" to "إضافة مطالبة ضمان جديدة",
        "warranty_new_dispute" to "إضافة نزاع جديد",
        "warranty_escalate_to_admin" to "التصعيد إلى الإدارة",
        "warranty_status_pending" to "معلق",
        "warranty_status_approved" to "موافق عليه",
        "warranty_status_rejected" to "مرفوض",
        "warranty_status_open" to "مفتوح",
        "warranty_status_in_progress" to "قيد التنفيذ",
        "warranty_status_resolved" to "محلول",
        
        // Data Export
        "export_title" to "تصدير البيانات",
        "export_data_type" to "نوع البيانات",
        "export_file_format" to "تنسيق الملف",
        "export_date_range" to "الفترة الزمنية",
        "export_start_export" to "بدء التصدير",
        "export_history" to "تاريخ التصدير",
        "export_orders" to "الطلبات",
        "export_invoices" to "الفواتير",
        "export_payments" to "المدفوعات",
        "export_staff_actions" to "أعمال الموظفين",
        "export_all_data" to "جميع البيانات",
        "export_csv" to "CSV",
        "export_excel" to "Excel",
        "export_pdf" to "PDF",
        "export_last_7_days" to "آخر 7 أيام",
        "export_last_30_days" to "آخر 30 يوم",
        "export_last_3_months" to "آخر 3 أشهر",
        "export_last_year" to "آخر سنة",
        "export_all_time" to "جميع الأوقات",
        "export_status_completed" to "مكتمل",
        "export_status_in_progress" to "قيد التنفيذ",
        "export_status_failed" to "فشل",
        "export_download" to "تحميل",
        
        // Settings
        "settings_title" to "الإعدادات",
        "settings_profile" to "الملف الشخصي",
        "settings_business_info" to "معلومات العمل",
        "settings_working_hours" to "ساعات العمل",
        "settings_services" to "الخدمات",
        "settings_pos_integration" to "تكامل نظام نقاط البيع",
        "settings_notifications" to "الإشعارات",
        "settings_language" to "اللغة",
        "settings_theme" to "المظهر",
        "settings_about" to "حول التطبيق",
        "settings_logout" to "تسجيل الخروج"
    )
}

object EnglishTranslations {
    fun getString(key: String): String {
        return translations[key] ?: key
    }
    
    private val translations = mapOf(
        // Common
        "app_name" to "Clutch Partners",
        "loading" to "Loading...",
        "error" to "Error",
        "success" to "Success",
        "cancel" to "Cancel",
        "save" to "Save",
        "delete" to "Delete",
        "edit" to "Edit",
        "add" to "Add",
        "search" to "Search",
        "filter" to "Filter",
        "sort" to "Sort",
        "refresh" to "Refresh",
        "back" to "Back",
        "next" to "Next",
        "previous" to "Previous",
        "done" to "Done",
        "close" to "Close",
        "ok" to "OK",
        "yes" to "Yes",
        "no" to "No",
        
        // Navigation
        "nav_home" to "Home",
        "nav_dashboard" to "Dashboard",
        "nav_payments" to "Payments",
        "nav_notifications" to "Notifications",
        "nav_support" to "Support",
        "nav_audit" to "Audit",
        "nav_warranty" to "Warranty",
        "nav_export" to "Export",
        "nav_settings" to "Settings",
        
        // Authentication
        "auth_sign_in" to "Sign In",
        "auth_sign_up" to "Sign Up",
        "auth_request_join" to "Request to Join",
        "auth_email" to "Email",
        "auth_password" to "Password",
        "auth_phone" to "Phone",
        "auth_partner_id" to "Partner ID",
        "auth_business_name" to "Business Name",
        "auth_owner_name" to "Owner Name",
        "auth_business_address" to "Business Address",
        "auth_forgot_password" to "Forgot Password?",
        "auth_remember_me" to "Remember Me",
        
        // Onboarding
        "onboarding_title_1" to "Manage Your Store",
        "onboarding_desc_1" to "Easily manage your orders and inventory",
        "onboarding_title_2" to "Receive Clutch Orders",
        "onboarding_desc_2" to "Receive and manage customer orders",
        "onboarding_title_3" to "Track Payments",
        "onboarding_desc_3" to "Monitor your revenue and payments",
        "onboarding_get_started" to "Get Started",
        "onboarding_skip" to "Skip",
        
        // Partner Types
        "partner_type_repair_center" to "Repair Center",
        "partner_type_auto_parts" to "Auto Parts Shop",
        "partner_type_accessories" to "Accessories Shop",
        "partner_type_importer" to "Importer",
        "partner_type_manufacturer" to "Manufacturer",
        "partner_type_service_center" to "Service Center",
        
        // KYC
        "kyc_title" to "Identity Verification",
        "kyc_upload_documents" to "Upload Documents",
        "kyc_vat_certificate" to "VAT Certificate",
        "kyc_trade_license" to "Trade License",
        "kyc_owner_id" to "Owner ID",
        "kyc_status_pending" to "Pending",
        "kyc_status_approved" to "Approved",
        "kyc_status_rejected" to "Rejected",
        
        // Home
        "home_orders" to "Orders",
        "home_appointments" to "Appointments",
        "home_recent_orders" to "Recent Orders",
        "home_today_orders" to "Today's Orders",
        "home_pending_orders" to "Pending Orders",
        "home_completed_orders" to "Completed Orders",
        
        // Dashboard
        "dashboard_revenue_overview" to "Revenue Overview",
        "dashboard_today_revenue" to "Today's Revenue",
        "dashboard_weekly_revenue" to "Weekly Revenue",
        "dashboard_monthly_revenue" to "Monthly Revenue",
        "dashboard_revenue_trend" to "Revenue Trend",
        "dashboard_orders" to "Orders",
        "dashboard_completed" to "Completed",
        "dashboard_in_progress" to "In Progress",
        "dashboard_pending" to "Pending",
        "dashboard_inventory_overview" to "Inventory Overview",
        "dashboard_total_products" to "Total Products",
        "dashboard_low_stock" to "Low Stock",
        "dashboard_out_of_stock" to "Out of Stock",
        
        // Payments
        "payments_weekly_income" to "Weekly Income",
        "payments_payout_countdown" to "Payout Countdown",
        "payments_payment_history" to "Payment History",
        "payments_total_earnings" to "Total Earnings",
        "payments_pending_payouts" to "Pending Payouts",
        "payments_completed_payouts" to "Completed Payouts",
        
        // Notifications
        "notifications_title" to "Notifications",
        "notifications_mark_all_read" to "Mark All as Read",
        "notifications_new_order" to "New Order",
        "notifications_payment_received" to "Payment Received",
        "notifications_system_update" to "System Update",
        "notifications_new_appointment" to "New Appointment",
        "notifications_inventory_alert" to "Inventory Alert",
        
        // Support
        "support_title" to "Support",
        "support_tickets" to "Tickets",
        "support_live_chat" to "Live Chat",
        "support_faq" to "FAQ",
        "support_create_ticket" to "Create New Ticket",
        "support_ticket_title" to "Ticket Title",
        "support_ticket_description" to "Ticket Description",
        "support_ticket_priority" to "Ticket Priority",
        "support_priority_low" to "Low",
        "support_priority_medium" to "Medium",
        "support_priority_high" to "High",
        "support_status_open" to "Open",
        "support_status_in_progress" to "In Progress",
        "support_status_closed" to "Closed",
        
        // Audit Log
        "audit_title" to "Audit Log",
        "audit_export_logs" to "Export Logs",
        "audit_refresh" to "Refresh",
        "audit_filter_all" to "All",
        "audit_filter_orders" to "Orders",
        "audit_filter_payments" to "Payments",
        "audit_filter_inventory" to "Inventory",
        "audit_filter_settings" to "Settings",
        "audit_filter_security" to "Security",
        "audit_severity_info" to "Info",
        "audit_severity_success" to "Success",
        "audit_severity_warning" to "Warning",
        "audit_severity_error" to "Error",
        
        // Warranty & Disputes
        "warranty_title" to "Warranty & Disputes",
        "warranty_claims" to "Warranty Claims",
        "warranty_disputes" to "Disputes",
        "warranty_escalations" to "Escalations",
        "warranty_new_claim" to "Submit New Warranty Claim",
        "warranty_new_dispute" to "Submit New Dispute",
        "warranty_escalate_to_admin" to "Escalate to Admin",
        "warranty_status_pending" to "Pending",
        "warranty_status_approved" to "Approved",
        "warranty_status_rejected" to "Rejected",
        "warranty_status_open" to "Open",
        "warranty_status_in_progress" to "In Progress",
        "warranty_status_resolved" to "Resolved",
        
        // Data Export
        "export_title" to "Data Export",
        "export_data_type" to "Data Type",
        "export_file_format" to "File Format",
        "export_date_range" to "Date Range",
        "export_start_export" to "Start Export",
        "export_history" to "Export History",
        "export_orders" to "Orders",
        "export_invoices" to "Invoices",
        "export_payments" to "Payments",
        "export_staff_actions" to "Staff Actions",
        "export_all_data" to "All Data",
        "export_csv" to "CSV",
        "export_excel" to "Excel",
        "export_pdf" to "PDF",
        "export_last_7_days" to "Last 7 days",
        "export_last_30_days" to "Last 30 days",
        "export_last_3_months" to "Last 3 months",
        "export_last_year" to "Last year",
        "export_all_time" to "All time",
        "export_status_completed" to "Completed",
        "export_status_in_progress" to "In Progress",
        "export_status_failed" to "Failed",
        "export_download" to "Download",
        
        // Settings
        "settings_title" to "Settings",
        "settings_profile" to "Profile",
        "settings_business_info" to "Business Info",
        "settings_working_hours" to "Working Hours",
        "settings_services" to "Services",
        "settings_pos_integration" to "POS Integration",
        "settings_notifications" to "Notifications",
        "settings_language" to "Language",
        "settings_theme" to "Theme",
        "settings_about" to "About",
        "settings_logout" to "Logout"
    )
}
