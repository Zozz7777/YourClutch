package com.clutch.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.clutch.app.ui.components.BottomNavigation
import com.clutch.app.ui.screens.DashboardScreen
import com.clutch.app.ui.screens.SplashScreen
import com.clutch.app.ui.screens.auth.LoginScreen
import com.clutch.app.ui.screens.onboarding.OnboardingScreen
import com.clutch.app.ui.screens.auth.SignupScreen
import com.clutch.app.ui.screens.auth.ForgotPasswordScreen
import com.clutch.app.ui.screens.parts.MyPartsScreen
import com.clutch.app.ui.screens.maintenance.MaintenanceAndPartsScreen
import com.clutch.app.ui.screens.services.ServicesScreen
import com.clutch.app.ui.screens.services.FindServiceCentersScreen
import com.clutch.app.ui.screens.services.ServiceCenterProfileScreen
import com.clutch.app.ui.screens.services.BookingConfirmationScreen
import com.clutch.app.ui.screens.services.SpecialtiesScreen
import com.clutch.app.ui.screens.shop.ShopPartsScreen
import com.clutch.app.ui.screens.shop.ProductBrowsingScreen
import com.clutch.app.ui.screens.shop.CategoriesScreen
import com.clutch.app.ui.screens.shop.CheckoutScreen
import com.clutch.app.ui.screens.shop.WishlistScreen
import com.clutch.app.ui.screens.shop.OrdersScreen
import com.clutch.app.ui.screens.shop.ProductDetailScreen
import com.clutch.app.ui.screens.shop.ShoppingCartScreen
import com.clutch.app.ui.screens.shop.SearchScreen
import com.clutch.app.ui.screens.account.AccountScreen
import com.clutch.app.ui.screens.account.AccountSettingsScreen
import com.clutch.app.ui.screens.account.WalletScreen
import com.clutch.app.ui.screens.account.SavedAddressesScreen
import com.clutch.app.ui.screens.car.CarHealthScreen
import com.clutch.app.ui.screens.car.CarRegistrationFlowScreen
import com.clutch.app.ui.screens.car.AddCarScreen
import com.clutch.app.ui.screens.car.BrandSelectionScreen
import com.clutch.app.ui.screens.car.CarsScreen
import com.clutch.app.ui.screens.service.BookServiceScreen
import com.clutch.app.ui.screens.parts.OrderPartsScreen
import com.clutch.app.ui.screens.community.CommunityScreen
import com.clutch.app.ui.screens.loyalty.LoyaltyScreen
import com.clutch.app.ui.screens.settings.SettingsScreen
import com.clutch.app.ui.screens.profile.ProfileScreen
import com.clutch.app.ui.screens.help.HelpScreen
import com.clutch.app.ui.screens.help.VideoTutorialScreen
import com.clutch.app.ui.screens.help.UserGuideScreen
import com.clutch.app.ui.screens.about.AboutScreen
import com.clutch.app.ui.screens.settings.NotificationsScreen
import com.clutch.app.ui.screens.settings.PrivacyScreen
import com.clutch.app.ui.screens.settings.LanguageScreen
import com.clutch.app.ui.screens.settings.ThemeScreen
import com.clutch.app.ui.screens.settings.SecurityScreen
import com.clutch.app.ui.screens.settings.DataScreen
import com.clutch.app.ui.screens.settings.StorageScreen
import com.clutch.app.ui.screens.settings.SyncScreen
import com.clutch.app.ui.screens.settings.MaintenanceSettingsScreen
import com.clutch.app.ui.screens.settings.MileageSettingsScreen
import com.clutch.app.ui.screens.settings.SettingsFeedbackScreen
import com.clutch.app.ui.screens.settings.RatingScreen
import com.clutch.app.ui.screens.profile.EditProfileScreen
import com.clutch.app.ui.screens.profile.ChangeAvatarScreen
import com.clutch.app.ui.screens.help.ContactSupportScreen
import com.clutch.app.ui.screens.help.FAQScreen
import com.clutch.app.ui.screens.help.FeedbackScreen
import com.clutch.app.ui.screens.about.PrivacyPolicyScreen
import com.clutch.app.ui.screens.about.TermsOfServiceScreen
import com.clutch.app.ui.screens.about.LicensesScreen
import com.clutch.app.ui.screens.about.RateAppScreen
import com.clutch.app.ui.screens.about.ShareAppScreen
import com.clutch.app.ui.screens.community.AddTipScreen
import com.clutch.app.ui.theme.ClutchAppTheme
import com.clutch.app.ui.theme.ClutchColors
import com.clutch.app.utils.SessionManager
import com.clutch.app.utils.TranslationManager
import com.clutch.app.utils.ThemeManager
import com.clutch.app.utils.LanguageManager
import com.clutch.app.utils.NotificationManager
import com.clutch.app.utils.CartManager
import com.clutch.app.utils.PopupManager
import com.clutch.app.utils.PopupOverlay
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    
    @Inject
    lateinit var sessionManager: SessionManager
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        
        // Set system UI colors - keep status bar transparent, navigation bar transparent
        window.statusBarColor = android.graphics.Color.TRANSPARENT
        window.navigationBarColor = android.graphics.Color.TRANSPARENT
        
        // Initialize language and theme based on device settings
                TranslationManager.initializeLanguage(this)
                ThemeManager.initialize(this)
                NotificationManager.initialize(this)
                CartManager.initialize(this)
        
        setContent {
            val isDarkTheme = ThemeManager.isDarkTheme(this)
            ClutchAppTheme(darkTheme = isDarkTheme) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(ClutchColors.background)
                        ) {
                            ClutchApp(
                                sessionManager = sessionManager,
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(ClutchColors.background)
                            )
                            
                            // Popup overlay for system-wide popups
                            PopupOverlay()
                        }
            }
        }
    }
}

@Composable
fun ClutchApp(
    sessionManager: SessionManager,
    modifier: Modifier = Modifier
) {
    var currentScreen by remember { mutableStateOf("splash") }
    var selectedTab by remember { mutableStateOf("home") }
    
    // Handle back button
    BackHandler {
        when {
            currentScreen != "dashboard" -> {
                // If not on dashboard, go back to previous screen or close app
                when (currentScreen) {
                    "login" -> {
                        currentScreen = "onboarding"
                    }
                    "signup" -> {
                        currentScreen = "login"
                    }
                    "forgot_password" -> {
                        currentScreen = "login"
                    }
                    "onboarding" -> {
                        // Close app on onboarding back
                        return@BackHandler
                    }
                    else -> {
                        currentScreen = "dashboard"
                    }
                }
            }
            selectedTab != "home" -> {
                // If on dashboard but not on home tab, go to home
                selectedTab = "home"
            }
            else -> {
                // If on home tab, close app
                return@BackHandler
            }
        }
        true
    }
    
    // Check if user is already logged in
    LaunchedEffect(Unit) {
        if (sessionManager.isLoggedIn()) {
            currentScreen = "dashboard"
        }
    }
    
    when (currentScreen) {
        "splash" -> SplashScreen(
            onNavigateToLogin = { currentScreen = "onboarding" },
            onNavigateToDashboard = { currentScreen = "dashboard" }
        )
          "onboarding" -> OnboardingScreen(
              onGetStarted = { currentScreen = "login" },
              onSkip = { currentScreen = "login" }
          )
          "login" -> LoginScreen(
              onLoginSuccess = { currentScreen = "car_registration_flow" },
              onNavigateToSignup = { currentScreen = "signup" },
              onNavigateToForgotPassword = { currentScreen = "forgot_password" }
          )
          "signup" -> SignupScreen(
              onNavigateBack = { currentScreen = "login" },
              onNavigateToLogin = { currentScreen = "login" },
              onSignupSuccess = { currentScreen = "car_registration_flow" }
          )
          "forgot_password" -> ForgotPasswordScreen(
              onNavigateBack = { currentScreen = "login" },
              onNavigateToLogin = { currentScreen = "login" },
              onResetPassword = { currentScreen = "login" }
          )
        "car_registration_flow" -> CarRegistrationFlowScreen(
            onFlowCompleted = { currentScreen = "dashboard" }
        )
        "dashboard" -> {
            Scaffold(
                bottomBar = {
                    BottomNavigation(
                        selectedRoute = selectedTab,
                        onNavigate = { route ->
                            selectedTab = route
                        }
                    )
                },
                containerColor = Color.Transparent
            ) { paddingValues ->
                Box(modifier = Modifier.padding(paddingValues)) {
                    when (selectedTab) {
                        "home" -> DashboardScreen(
                            onNavigateToCarHealth = { selectedTab = "car_health" },
                            onNavigateToBookService = { selectedTab = "book_service" },
                            onNavigateToOrderParts = { selectedTab = "parts" },
                            onNavigateToCommunity = { selectedTab = "community" },
                            onNavigateToLoyalty = { selectedTab = "loyalty" },
                            onNavigateToAddCar = { selectedTab = "add_car" },
                            onNavigateToMaintenance = { selectedTab = "parts" }
                        )
                        "parts" -> MaintenanceAndPartsScreen(
                            onNavigateBack = { selectedTab = "home" },
                            onNavigateToAddCar = { selectedTab = "add_car" }
                        )
                        "services" -> ServicesScreen(
                            onNavigateToMaintenance = { selectedTab = "parts" },
                            onNavigateToBookService = { selectedTab = "find_service_centers" },
                            onNavigateToEmergencyService = { selectedTab = "emergency_service" },
                            onNavigateToServiceHistory = { selectedTab = "service_history" }
                        )
                        "shop_parts" -> ShopPartsScreen(
                            onNavigateToCart = { selectedTab = "cart" },
                            onNavigateToOrders = { selectedTab = "orders" },
                            onNavigateToWishlist = { selectedTab = "wishlist" },
                            onNavigateToSearch = { selectedTab = "product_browsing" }
                        )
                        "account" -> AccountScreen(
                            onNavigateToSettings = { selectedTab = "settings" },
                            onNavigateToAccountSettings = { selectedTab = "account_settings" },
                            onNavigateToWallet = { selectedTab = "wallet" },
                            onNavigateToSavedAddresses = { selectedTab = "saved_addresses" },
                            onNavigateToCars = { selectedTab = "cars" },
                            onNavigateToHelp = { selectedTab = "help" },
                            onNavigateToAbout = { selectedTab = "about" },
                            onSignOut = { 
                                // TODO: Implement sign out logic
                                selectedTab = "home"
                            }
                        )
                        "car_health" -> CarHealthScreen()
                        "add_car" -> AddCarScreen(
                            onNavigateBack = { selectedTab = "home" },
                            onNavigateToBrandSelection = { selectedTab = "brand_selection" },
                            onNavigateToModelSelection = { brand: String -> selectedTab = "model_selection" },
                            onNavigateToTrimSelection = { brand: String, model: String -> selectedTab = "trim_selection" },
                            onNavigateToLastMaintenance = { selectedTab = "last_maintenance" },
                            onNavigateToEmergencyOrder = { selectedTab = "emergency_order" }
                        )
                        "brand_selection" -> BrandSelectionScreen(
                            onNavigateBack = { selectedTab = "add_car" },
                            onBrandSelected = { brand -> 
                                // TODO: Handle brand selection - update AddCarScreen with selected brand
                                selectedTab = "add_car"
                            }
                        )
                        "book_service" -> BookServiceScreen(
                            onBookService = { bookingResult -> 
                                // Handle booking result
                                when (bookingResult) {
                                    "booking_success" -> {
                                        // Show success message or navigate to confirmation
                                        selectedTab = "home"
                                    }
                                }
                            }
                        )
                        "order_parts" -> OrderPartsScreen()
                        "community" -> CommunityScreen(
                            onAddNewTip = { selectedTab = "add_tip" }
                        )
                        "loyalty" -> LoyaltyScreen(
                            onRedeemReward = { redemptionResult -> 
                                // Handle redemption result
                                when (redemptionResult) {
                                    "redemption_success" -> {
                                        // Show success message or navigate to confirmation
                                        selectedTab = "home"
                                    }
                                }
                            }
                        )
                        "settings" -> SettingsScreen(
                            onNavigateBack = { selectedTab = "account" },
                            onNavigateToProfile = { selectedTab = "profile" },
                            onNavigateToNotifications = { selectedTab = "notifications" },
                            onNavigateToPrivacy = { selectedTab = "privacy" },
                            onNavigateToAbout = { selectedTab = "about" },
                            onNavigateToHelp = { selectedTab = "help" },
                            onNavigateToLanguage = { selectedTab = "language" },
                            onNavigateToTheme = { selectedTab = "theme" },
                            onNavigateToSecurity = { selectedTab = "security" },
                            onNavigateToData = { selectedTab = "data" },
                            onNavigateToWallet = { selectedTab = "wallet" },
                            onNavigateToSavedAddresses = { selectedTab = "saved_addresses" },
                            onNavigateToCars = { selectedTab = "cars" },
                            onNavigateToStorage = { selectedTab = "storage" },
                            onNavigateToSync = { selectedTab = "sync" },
                            onNavigateToMaintenanceSettings = { selectedTab = "maintenance_settings" },
                            onNavigateToMileageSettings = { selectedTab = "mileage_settings" },
                            onNavigateToFeedback = { selectedTab = "feedback" },
                            onNavigateToRating = { selectedTab = "rating" }
                        )
                        "notifications" -> NotificationsScreen(
                            onNavigateBack = { selectedTab = "settings" }
                        )
                        "privacy" -> PrivacyScreen(
                            onNavigateBack = { selectedTab = "settings" }
                        )
                        "language" -> LanguageScreen(
                            onNavigateBack = { selectedTab = "settings" }
                        )
                        "theme" -> ThemeScreen(
                            onNavigateBack = { selectedTab = "settings" }
                        )
                        "security" -> SecurityScreen(
                            onNavigateBack = { selectedTab = "settings" }
                        )
                        "data" -> DataScreen(
                            onNavigateBack = { selectedTab = "settings" }
                        )
                        "profile" -> ProfileScreen(
                            onNavigateBack = { selectedTab = "account" },
                            onEditProfile = { selectedTab = "edit_profile" },
                            onChangeAvatar = { selectedTab = "change_avatar" },
                            onNavigateToSettings = { selectedTab = "settings" }
                        )
                        "edit_profile" -> EditProfileScreen(
                            onNavigateBack = { selectedTab = "profile" },
                            onSaveProfile = { /* Handle profile save */ }
                        )
                        "change_avatar" -> ChangeAvatarScreen(
                            onNavigateBack = { selectedTab = "profile" },
                            onAvatarSelected = { /* Handle avatar selection */ }
                        )
                        "help" -> HelpScreen(
                            onNavigateBack = { selectedTab = "account" },
                            onContactSupport = { selectedTab = "contact_support" },
                            onViewFAQ = { faqType ->
                                when (faqType) {
                                    "video_tutorials" -> selectedTab = "video_tutorials"
                                    "user_guide" -> selectedTab = "user_guide"
                                    else -> selectedTab = "faq"
                                }
                            },
                            onSendFeedback = { selectedTab = "feedback" }
                        )
                        "video_tutorials" -> VideoTutorialScreen(
                            onNavigateBack = { selectedTab = "help" },
                            onVideoSelected = { video -> 
                                // Handle video selection - could open video player
                                selectedTab = "help"
                            }
                        )
                        "user_guide" -> UserGuideScreen(
                            onNavigateBack = { selectedTab = "help" },
                            onSectionSelected = { section ->
                                // Handle section selection - could open detailed guide
                                selectedTab = "help"
                            }
                        )
                        "contact_support" -> ContactSupportScreen(
                            onNavigateBack = { selectedTab = "help" }
                        )
                        "faq" -> FAQScreen(
                            onNavigateBack = { selectedTab = "help" }
                        )
                        "feedback" -> FeedbackScreen(
                            onNavigateBack = { selectedTab = "help" }
                        )
                        "about" -> AboutScreen(
                            onNavigateBack = { selectedTab = "account" },
                            onViewPrivacyPolicy = { selectedTab = "privacy_policy" },
                            onViewTermsOfService = { selectedTab = "terms_of_service" },
                            onViewLicenses = { selectedTab = "licenses" },
                            onRateApp = { selectedTab = "rate_app" },
                            onShareApp = { selectedTab = "share_app" }
                        )
                        "privacy_policy" -> PrivacyPolicyScreen(
                            onNavigateBack = { selectedTab = "about" }
                        )
                        "terms_of_service" -> TermsOfServiceScreen(
                            onNavigateBack = { selectedTab = "about" }
                        )
                        "licenses" -> LicensesScreen(
                            onNavigateBack = { selectedTab = "about" }
                        )
                        "rate_app" -> RateAppScreen(
                            onNavigateBack = { selectedTab = "about" }
                        )
                        "share_app" -> ShareAppScreen(
                            onNavigateBack = { selectedTab = "about" }
                        )
                        "add_tip" -> AddTipScreen(
                            onNavigateBack = { selectedTab = "community" }
                        )
                        "account_settings" -> AccountSettingsScreen(
                            onNavigateBack = { selectedTab = "account" },
                            onSaveProfile = { selectedTab = "account" },
                            onNavigateToChangeAvatar = { selectedTab = "change_avatar" }
                        )
                        "wallet" -> WalletScreen(
                            onNavigateBack = { selectedTab = "account" },
                            onAddMoney = { /* TODO: Implement add money */ },
                            onWithdrawMoney = { /* TODO: Implement withdraw money */ },
                            onViewTransactions = { /* TODO: Implement view transactions */ },
                            onViewCards = { /* TODO: Implement view cards */ }
                        )
                        "saved_addresses" -> SavedAddressesScreen(
                            onNavigateBack = { selectedTab = "account" },
                            onAddAddress = { /* TODO: Implement add address */ },
                            onEditAddress = { /* TODO: Implement edit address */ },
                            onDeleteAddress = { /* TODO: Implement delete address */ },
                            onSetDefaultAddress = { /* TODO: Implement set default address */ }
                        )
                        "cars" -> CarsScreen(
                            onNavigateBack = { selectedTab = "account" },
                            onAddCar = { selectedTab = "add_car" },
                            onEditCar = { /* TODO: Implement edit car */ },
                            onDeleteCar = { /* TODO: Implement delete car */ },
                            onSetDefaultCar = { /* TODO: Implement set default car */ }
                        )
                        "storage" -> StorageScreen(
                            onNavigateBack = { selectedTab = "settings" }
                        )
                        "sync" -> SyncScreen(
                            onNavigateBack = { selectedTab = "settings" }
                        )
                        "maintenance_settings" -> MaintenanceSettingsScreen(
                            onNavigateBack = { selectedTab = "settings" }
                        )
                        "mileage_settings" -> MileageSettingsScreen(
                            onNavigateBack = { selectedTab = "settings" }
                        )
                        "feedback" -> SettingsFeedbackScreen(
                            onNavigateBack = { selectedTab = "settings" }
                        )
                        "rating" -> RatingScreen(
                            onNavigateBack = { selectedTab = "settings" }
                        )
                        "find_service_centers" -> FindServiceCentersScreen(
                            onNavigateBack = { selectedTab = "services" },
                            onNavigateToSort = { selectedTab = "sort_modal" },
                            onNavigateToMap = { selectedTab = "map_view" },
                            onNavigateToFilter = { selectedTab = "filter_modal" },
                            onNavigateToServiceCenterProfile = { serviceCenterId -> selectedTab = "service_center_profile" },
                            onNavigateToSpecialties = { selectedTab = "specialties" }
                        )
                        "service_center_profile" -> ServiceCenterProfileScreen(
                            serviceCenterId = "1",
                            onNavigateBack = { selectedTab = "find_service_centers" },
                            onNavigateToBooking = { serviceCenterId -> selectedTab = "booking_confirmation" },
                            onNavigateToViewAllReviews = { selectedTab = "reviews" }
                        )
                        "booking_confirmation" -> BookingConfirmationScreen(
                            serviceCenterId = "1",
                            onNavigateBack = { selectedTab = "service_center_profile" },
                            onNavigateToOtherCar = { selectedTab = "cars" },
                            onConfirmBooking = { selectedTab = "home" }
                        )
                        "specialties" -> SpecialtiesScreen(
                            onNavigateBack = { selectedTab = "find_service_centers" },
                            onNavigateToServiceCenters = { specialty -> selectedTab = "find_service_centers" }
                        )
                        "product_browsing" -> ProductBrowsingScreen(
                            onNavigateBack = { selectedTab = "shop_parts" },
                            onNavigateToSearch = { selectedTab = "search_parts" },
                            onNavigateToAddVehicle = { selectedTab = "add_car" },
                            onNavigateToProductDetail = { productId -> selectedTab = "product_detail" },
                            onNavigateToCategory = { categoryName -> selectedTab = "categories" }
                        )
                        "product_detail" -> ProductDetailScreen(
                            productId = "1",
                            onNavigateBack = { selectedTab = "product_browsing" },
                            onNavigateToCart = { selectedTab = "cart" },
                            onAddToFavorites = { /* TODO: Implement add to favorites */ },
                            onAddToCart = { /* TODO: Implement add to cart */ }
                        )
                        "cart" -> ShoppingCartScreen(
                            onNavigateBack = { selectedTab = "product_browsing" },
                            onNavigateToCheckout = { selectedTab = "checkout" },
                            onNavigateToProductDetail = { productId -> selectedTab = "product_detail" },
                            onRemoveItem = { itemId -> /* TODO: Implement remove item */ },
                            onUpdateQuantity = { itemId, quantity -> /* TODO: Implement update quantity */ }
                        )
                        "categories" -> CategoriesScreen(
                            onNavigateBack = { selectedTab = "product_browsing" },
                            onNavigateToProductList = { categoryName -> selectedTab = "product_browsing" },
                            onNavigateToSearch = { selectedTab = "search_parts" }
                        )
                        "checkout" -> CheckoutScreen(
                            onNavigateBack = { selectedTab = "cart" },
                            onNavigateToPayment = { selectedTab = "payment" },
                            onNavigateToAddresses = { selectedTab = "saved_addresses" },
                            onPlaceOrder = { selectedTab = "order_confirmation" }
                        )
                        "wishlist" -> WishlistScreen(
                            onNavigateBack = { selectedTab = "shop_parts" },
                            onNavigateToProductDetail = { productId -> selectedTab = "product_detail" },
                            onRemoveFromWishlist = { itemId -> /* TODO: Implement remove from wishlist */ },
                            onAddToCart = { itemId -> /* TODO: Implement add to cart */ }
                        )
                        "orders" -> OrdersScreen(
                            onNavigateBack = { selectedTab = "shop_parts" },
                            onNavigateToOrderDetail = { orderId -> selectedTab = "order_detail" },
                            onReorder = { orderId -> /* TODO: Implement reorder */ },
                            onTrackOrder = { orderId -> /* TODO: Implement track order */ },
                            onCancelOrder = { orderId -> /* TODO: Implement cancel order */ }
                        )
                        "search_parts" -> SearchScreen(
                            onNavigateBack = { selectedTab = "product_browsing" },
                            onNavigateToProductDetail = { productId -> selectedTab = "product_detail" },
                            onNavigateToFilter = { selectedTab = "filter_modal" }
                        )
                    }
                }
            }
        }
    }
}
