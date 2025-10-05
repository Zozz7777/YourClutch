import SwiftUI
import Combine

@MainActor
class AppRouter: ObservableObject {
    @Published var currentScreen: Screen = .splash
    @Published var navigationPath = NavigationPath()
    @Published var isAuthenticated = false
    @Published var selectedTab: Tab = .home
    
    private var cancellables = Set<AnyCancellable>()
    
    init() {
        setupNavigation()
    }
    
    private func setupNavigation() {
        // Listen for authentication changes
        $isAuthenticated
            .sink { [weak self] isAuth in
                if isAuth {
                    self?.navigateToMain()
                } else {
                    self?.navigateToAuth()
                }
            }
            .store(in: &cancellables)
    }
    
    func navigateTo(_ screen: Screen) {
        currentScreen = screen
        navigationPath.append(screen)
    }
    
    func navigateBack() {
        if !navigationPath.isEmpty {
            navigationPath.removeLast()
        }
    }
    
    func navigateToRoot() {
        navigationPath = NavigationPath()
    }
    
    func navigateToMain() {
        currentScreen = .main
        selectedTab = .home
    }
    
    func navigateToAuth() {
        currentScreen = .onboarding
        selectedTab = .home
    }
    
    func handleDeepLink(_ url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false) else { return }
        
        switch components.path {
        case "/order":
            if let orderId = components.queryItems?.first(where: { $0.name == "id" })?.value {
                navigateTo(.orderDetails(orderId))
            }
        case "/payment":
            if let paymentId = components.queryItems?.first(where: { $0.name == "id" })?.value {
                navigateTo(.paymentDetails(paymentId))
            }
        case "/appointment":
            if let appointmentId = components.queryItems?.first(where: { $0.name == "id" })?.value {
                navigateTo(.appointmentDetails(appointmentId))
            }
        case "/vehicle":
            if let vehicleId = components.queryItems?.first(where: { $0.name == "id" })?.value {
                navigateTo(.vehicleDetails(vehicleId))
            }
        case "/quote":
            if let quoteId = components.queryItems?.first(where: { $0.name == "id" })?.value {
                navigateTo(.quoteDetails(quoteId))
            }
        case "/promotion":
            if let promotionId = components.queryItems?.first(where: { $0.name == "id" })?.value {
                navigateTo(.promotionDetails(promotionId))
            }
        case "/training":
            if let trainingId = components.queryItems?.first(where: { $0.name == "id" })?.value {
                navigateTo(.trainingDetails(trainingId))
            }
        case "/catalog":
            if let productId = components.queryItems?.first(where: { $0.name == "id" })?.value {
                navigateTo(.catalogDetails(productId))
            }
        case "/supplier":
            if let supplierId = components.queryItems?.first(where: { $0.name == "id" })?.value {
                navigateTo(.supplierDetails(supplierId))
            }
        default:
            break
        }
    }
}

enum Screen: Hashable {
    case splash
    case onboarding
    case partnerTypeSelector
    case auth
    case signIn
    case signUp
    case requestToJoin
    case forgotPassword
    case kyc
    case main
    case home
    case dashboard
    case payments
    case settings
    case loyalty
    case ratings
    case notifications
    case support
    case audit
    case warranty
    case export
    case pos
    case inventory
    case purchaseOrders
    case suppliers
    case devices
    case staff
    case contracts
    case reports
    case appointments
    case vehicles
    case quotes
    case promotions
    case feedback
    case catalog
    case training
    case orderDetails(String)
    case paymentDetails(String)
    case appointmentDetails(String)
    case vehicleDetails(String)
    case quoteDetails(String)
    case promotionDetails(String)
    case trainingDetails(String)
    case catalogDetails(String)
    case supplierDetails(String)
}

enum Tab: String, CaseIterable {
    case home = "home"
    case dashboard = "dashboard"
    case payments = "payments"
    case settings = "settings"
    
    var title: String {
        switch self {
        case .home:
            return NSLocalizedString("nav.home", comment: "")
        case .dashboard:
            return NSLocalizedString("nav.dashboard", comment: "")
        case .payments:
            return NSLocalizedString("nav.payments", comment: "")
        case .settings:
            return NSLocalizedString("nav.settings", comment: "")
        }
    }
    
    var icon: String {
        switch self {
        case .home:
            return "house"
        case .dashboard:
            return "chart.bar"
        case .payments:
            return "creditcard"
        case .settings:
            return "gearshape"
        }
    }
}

struct AppRouterView: View {
    @StateObject private var router = AppRouter()
    
    var body: some View {
        NavigationStack(path: $router.navigationPath) {
            Group {
                switch router.currentScreen {
                case .splash:
                    SplashScreen()
                case .onboarding:
                    OnboardingScreen()
                case .partnerTypeSelector:
                    PartnerTypeSelectorScreen()
                case .auth:
                    AuthScreen()
                case .signIn:
                    SignInScreen()
                case .signUp:
                    SignUpScreen()
                case .requestToJoin:
                    RequestToJoinScreen()
                case .forgotPassword:
                    ForgotPasswordScreen()
                case .kyc:
                    KYCScreen()
                case .main:
                    MainScreen()
                case .home:
                    HomeScreen()
                case .dashboard:
                    DashboardScreen()
                case .payments:
                    PaymentsScreen()
                case .settings:
                    SettingsScreen()
                case .loyalty:
                    LoyaltyScreen()
                case .ratings:
                    RatingsScreen()
                case .notifications:
                    NotificationsScreen()
                case .support:
                    SupportScreen()
                case .audit:
                    AuditScreen()
                case .warranty:
                    WarrantyScreen()
                case .export:
                    ExportScreen()
                case .pos:
                    POSScreen()
                case .inventory:
                    InventoryScreen()
                case .purchaseOrders:
                    PurchaseOrdersScreen()
                case .suppliers:
                    SuppliersScreen()
                case .devices:
                    DevicesScreen()
                case .staff:
                    StaffScreen()
                case .contracts:
                    ContractsScreen()
                case .reports:
                    ReportsScreen()
                case .appointments:
                    AppointmentsScreen()
                case .vehicles:
                    VehiclesScreen()
                case .quotes:
                    QuotesScreen()
                case .promotions:
                    PromotionsScreen()
                case .feedback:
                    FeedbackScreen()
                case .catalog:
                    CatalogScreen()
                case .training:
                    TrainingScreen()
                case .orderDetails(let orderId):
                    OrderDetailsScreen(orderId: orderId)
                case .paymentDetails(let paymentId):
                    PaymentDetailsScreen(paymentId: paymentId)
                case .appointmentDetails(let appointmentId):
                    AppointmentDetailsScreen(appointmentId: appointmentId)
                case .vehicleDetails(let vehicleId):
                    VehicleDetailsScreen(vehicleId: vehicleId)
                case .quoteDetails(let quoteId):
                    QuoteDetailsScreen(quoteId: quoteId)
                case .promotionDetails(let promotionId):
                    PromotionDetailsScreen(promotionId: promotionId)
                case .trainingDetails(let trainingId):
                    TrainingDetailsScreen(trainingId: trainingId)
                case .catalogDetails(let productId):
                    CatalogDetailsScreen(productId: productId)
                case .supplierDetails(let supplierId):
                    SupplierDetailsScreen(supplierId: supplierId)
                }
            }
            .navigationDestination(for: Screen.self) { screen in
                destinationView(for: screen)
            }
        }
        .environmentObject(router)
        .onOpenURL { url in
            router.handleDeepLink(url)
        }
    }
    
    @ViewBuilder
    private func destinationView(for screen: Screen) -> some View {
        switch screen {
        case .splash:
            SplashScreen()
        case .onboarding:
            OnboardingScreen()
        case .partnerTypeSelector:
            PartnerTypeSelectorScreen()
        case .auth:
            AuthScreen()
        case .signIn:
            SignInScreen()
        case .signUp:
            SignUpScreen()
        case .requestToJoin:
            RequestToJoinScreen()
        case .forgotPassword:
            ForgotPasswordScreen()
        case .kyc:
            KYCScreen()
        case .main:
            MainScreen()
        case .home:
            HomeScreen()
        case .dashboard:
            DashboardScreen()
        case .payments:
            PaymentsScreen()
        case .settings:
            SettingsScreen()
        case .loyalty:
            LoyaltyScreen()
        case .ratings:
            RatingsScreen()
        case .notifications:
            NotificationsScreen()
        case .support:
            SupportScreen()
        case .audit:
            AuditScreen()
        case .warranty:
            WarrantyScreen()
        case .export:
            ExportScreen()
        case .pos:
            POSScreen()
        case .inventory:
            InventoryScreen()
        case .purchaseOrders:
            PurchaseOrdersScreen()
        case .suppliers:
            SuppliersScreen()
        case .devices:
            DevicesScreen()
        case .staff:
            StaffScreen()
        case .contracts:
            ContractsScreen()
        case .reports:
            ReportsScreen()
        case .appointments:
            AppointmentsScreen()
        case .vehicles:
            VehiclesScreen()
        case .quotes:
            QuotesScreen()
        case .promotions:
            PromotionsScreen()
        case .feedback:
            FeedbackScreen()
        case .catalog:
            CatalogScreen()
        case .training:
            TrainingScreen()
        case .orderDetails(let orderId):
            OrderDetailsScreen(orderId: orderId)
        case .paymentDetails(let paymentId):
            PaymentDetailsScreen(paymentId: paymentId)
        case .appointmentDetails(let appointmentId):
            AppointmentDetailsScreen(appointmentId: appointmentId)
        case .vehicleDetails(let vehicleId):
            VehicleDetailsScreen(vehicleId: vehicleId)
        case .quoteDetails(let quoteId):
            QuoteDetailsScreen(quoteId: quoteId)
        case .promotionDetails(let promotionId):
            PromotionDetailsScreen(promotionId: promotionId)
        case .trainingDetails(let trainingId):
            TrainingDetailsScreen(trainingId: trainingId)
        case .catalogDetails(let productId):
            CatalogDetailsScreen(productId: productId)
        case .supplierDetails(let supplierId):
            SupplierDetailsScreen(supplierId: supplierId)
        }
    }
}

// MARK: - Deep Link Handling
extension AppRouter {
    func handleNotificationDeepLink(_ userInfo: [AnyHashable: Any]) {
        guard let type = userInfo["type"] as? String else { return }
        
        switch type {
        case "order":
            if let orderId = userInfo["orderId"] as? String {
                navigateTo(.orderDetails(orderId))
            }
        case "payment":
            if let paymentId = userInfo["paymentId"] as? String {
                navigateTo(.paymentDetails(paymentId))
            }
        case "appointment":
            if let appointmentId = userInfo["appointmentId"] as? String {
                navigateTo(.appointmentDetails(appointmentId))
            }
        case "notification":
            if let notificationId = userInfo["notificationId"] as? String {
                navigateTo(.notifications)
            }
        default:
            break
        }
    }
}

// MARK: - Navigation Helpers
extension AppRouter {
    func navigateToTab(_ tab: Tab) {
        selectedTab = tab
        switch tab {
        case .home:
            navigateTo(.home)
        case .dashboard:
            navigateTo(.dashboard)
        case .payments:
            navigateTo(.payments)
        case .settings:
            navigateTo(.settings)
        }
    }
    
    func navigateToAdvancedFeatures() {
        // Navigate to advanced features based on user role
        navigateTo(.pos)
    }
    
    func navigateToCustomerFeatures() {
        // Navigate to customer features
        navigateTo(.appointments)
    }
    
    func navigateToGrowthFeatures() {
        // Navigate to growth features
        navigateTo(.catalog)
    }
}
