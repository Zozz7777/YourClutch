import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var authService: AuthService
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            // Home Tab - Orders/Appointments
            OrdersView()
                .tabItem {
                    Image(systemName: "house.fill")
                    Text("Home")
                }
                .tag(0)
            
            // Payments Tab
            PaymentsView()
                .tabItem {
                    Image(systemName: "creditcard.fill")
                    Text("Payments")
                }
                .tag(1)
            
            // Store Settings Tab
            StoreSettingsView()
                .tabItem {
                    Image(systemName: "gearshape.fill")
                    Text("Settings")
                }
                .tag(2)
            
            // Business Dashboard Tab (for connected partners)
            if authService.currentUser?.partnerType == .autoPartsShop ||
               authService.currentUser?.partnerType == .importerManufacturer {
                BusinessDashboardView()
                    .tabItem {
                        Image(systemName: "chart.bar.fill")
                        Text("Dashboard")
                    }
                    .tag(3)
            }
        }
        .accentColor(.designPrimary)
    }
}

struct OrdersView: View {
    @EnvironmentObject var authService: AuthService
    @State private var orders: [PartnerOrder] = []
    @State private var isLoading = false
    @State private var errorMessage = ""
    
    var body: some View {
        NavigationView {
            VStack {
                if isLoading {
                    ProgressView("Loading orders...")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if orders.isEmpty {
                    // Empty state
                    VStack(spacing: 16) {
                        Image(systemName: "tray")
                            .font(.system(size: 60))
                            .foregroundColor(.designMutedForeground)
                        
                        Text("No Orders Yet")
                            .font(.designHeadlineLarge)
                        
                        Text("You'll see customer orders and appointments here once they start coming in.")
                            .font(.designBodyMedium)
                            .foregroundColor(.designMutedForeground)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List(orders) { order in
                        OrderRowView(order: order)
                    }
                    .refreshable {
                        await loadOrders()
                    }
                }
            }
            .navigationTitle("Orders & Appointments")
            .onAppear {
                Task {
                    await loadOrders()
                }
            }
        }
    }
    
    private func loadOrders() async {
        isLoading = true
        errorMessage = ""
        
        do {
            // Simulate API call
            try await Task.sleep(nanoseconds: 1_000_000_000) // 1 second
            // In real implementation, call the API service
            orders = []
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
}

struct OrderRowView: View {
    let order: PartnerOrder
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(order.serviceName)
                    .font(.designHeadlineMedium)
                
                Spacer()
                
                Text(order.status.rawValue)
                    .font(.designLabelSmall)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(statusColor.opacity(0.2))
                    .foregroundColor(statusColor)
                    .cornerRadius(DesignTokens.BorderRadius.sm)
            }
            
            Text("Customer: \(order.customerName)")
                .font(.designBodyMedium)
                .foregroundColor(.designMutedForeground)
            
            Text("Date: \(order.createdAt, formatter: dateFormatter)")
                .font(.designLabelSmall)
                .foregroundColor(.designMutedForeground)
        }
        .padding(.vertical, 4)
    }
    
    private var statusColor: Color {
        switch order.status {
        case .pending:
            return .designWarning
        case .paid:
            return .designSuccess
        case .rejected:
            return .designDestructive
        }
    }
    
    private let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter
    }()
}

struct PaymentsView: View {
    @EnvironmentObject var authService: AuthService
    @State private var weeklyIncome: Double = 0
    @State private var payoutCountdown: String = ""
    @State private var paymentHistory: [PartnerPayment] = []
    @State private var isLoading = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Weekly income card
                    VStack(alignment: .leading, spacing: 16) {
                        Text("This Week's Income")
                            .font(.designHeadlineMedium)
                        
                        Text("EGP \(weeklyIncome, specifier: "%.2f")")
                            .font(.designDisplayMedium)
                            .foregroundColor(.designForeground)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color.designMuted)
                    .cornerRadius(DesignTokens.BorderRadius.lg)
                    
                    // Payout countdown card
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Next Payout")
                            .font(.designHeadlineMedium)
                        
                        Text(payoutCountdown)
                            .font(.designHeadlineLarge)
                            .foregroundColor(.designForeground)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color.designMuted)
                    .cornerRadius(DesignTokens.BorderRadius.lg)
                    
                    // Payment history
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Payment History")
                            .font(.designHeadlineMedium)
                        
                        if paymentHistory.isEmpty {
                            VStack(spacing: 16) {
                                Image(systemName: "creditcard")
                                    .font(.system(size: 40))
                                    .foregroundColor(.designMutedForeground)
                                
                                Text("No payments yet")
                                    .font(.designBodyMedium)
                                    .foregroundColor(.designMutedForeground)
                            }
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 32)
                        } else {
                            ForEach(paymentHistory) { payment in
                                PaymentRowView(payment: payment)
                            }
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Payments")
            .onAppear {
                loadPayments()
            }
        }
    }
    
    private func loadPayments() {
        isLoading = true
        
        // Simulate API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            weeklyIncome = 2500.0
            payoutCountdown = "3 days"
            paymentHistory = []
            isLoading = false
        }
    }
}

struct PaymentRowView: View {
    let payment: PartnerPayment
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("EGP \(payment.amount, specifier: "%.2f")")
                    .font(.designHeadlineMedium)
                
                Text(payment.createdAt, formatter: dateFormatter)
                    .font(.designLabelSmall)
                    .foregroundColor(.designMutedForeground)
            }
            
            Spacer()
            
            Text(payment.status.rawValue)
                .font(.designLabelSmall)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(statusColor.opacity(0.2))
                .foregroundColor(statusColor)
                .cornerRadius(DesignTokens.BorderRadius.sm)
        }
        .padding()
        .background(Color.designMuted)
        .cornerRadius(DesignTokens.BorderRadius.sm)
    }
    
    private var statusColor: Color {
        switch payment.status {
        case .pending:
            return .designWarning
        case .completed:
            return .designSuccess
        case .failed:
            return .designDestructive
        }
    }
    
    private let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter
    }()
}

struct StoreSettingsView: View {
    @EnvironmentObject var authService: AuthService
    @State private var businessName = ""
    @State private var businessAddress = ""
    @State private var phoneNumber = ""
    @State private var workingHours = ""
    @State private var isConnectedToPartsSystem = false
    @State private var isLoading = false
    @State private var showLogoutAlert = false
    
    var body: some View {
        NavigationView {
            Form {
                Section("Business Information") {
                    TextField("Business Name", text: $businessName)
                    TextField("Business Address", text: $businessAddress)
                    TextField("Phone Number", text: $phoneNumber)
                    TextField("Working Hours", text: $workingHours)
                }
                
                Section("Services") {
                    Toggle("Enable Service Orders", isOn: .constant(true))
                    Toggle("Enable Product Orders", isOn: .constant(true))
                    Toggle("Enable Appointments", isOn: .constant(true))
                }
                
                Section("Integration") {
                    Toggle("Connect to Clutch Parts System", isOn: $isConnectedToPartsSystem)
                }
                
                Section {
                    Button("Save Changes") {
                        saveSettings()
                    }
                    .disabled(isLoading)
                }
                
                Section {
                    Button("Logout") {
                        showLogoutAlert = true
                    }
                    .foregroundColor(.designDestructive)
                }
            }
            .navigationTitle("Store Settings")
            .onAppear {
                loadSettings()
            }
            .alert("Logout", isPresented: $showLogoutAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Logout", role: .destructive) {
                    authService.logout()
                }
            } message: {
                Text("Are you sure you want to logout?")
            }
        }
    }
    
    private func loadSettings() {
        // Load current settings from API
        businessName = authService.currentUser?.businessName ?? ""
        businessAddress = authService.currentUser?.businessAddress?.street ?? ""
        phoneNumber = authService.currentUser?.phone ?? ""
        workingHours = "9:00 AM - 6:00 PM"
        isConnectedToPartsSystem = false
    }
    
    private func saveSettings() {
        isLoading = true
        
        // Save settings to API
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            isLoading = false
        }
    }
}

struct BusinessDashboardView: View {
    @EnvironmentObject var authService: AuthService
    @State private var revenue: Double = 0
    @State private var orderCount: Int = 0
    @State private var inventoryCount: Int = 0
    @State private var isLoading = false
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 24) {
                    // Revenue card
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Total Revenue")
                            .font(.designHeadlineMedium)
                        
                        Text("EGP \(revenue, specifier: "%.2f")")
                            .font(.designDisplayMedium)
                            .foregroundColor(.designForeground)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding()
                    .background(Color.designMuted)
                    .cornerRadius(DesignTokens.BorderRadius.lg)
                    
                    // Stats grid
                    LazyVGrid(columns: [
                        GridItem(.flexible()),
                        GridItem(.flexible())
                    ], spacing: 16) {
                        StatCard(title: "Orders", value: "\(orderCount)", icon: "cart.fill")
                        StatCard(title: "Inventory", value: "\(inventoryCount)", icon: "cube.box.fill")
                    }
                    
                    // Charts placeholder
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Performance Charts")
                            .font(.designHeadlineMedium)
                        
                        RoundedRectangle(cornerRadius: DesignTokens.BorderRadius.lg)
                            .fill(Color.designMuted)
                            .frame(height: 200)
                            .overlay(
                                VStack {
                                    Image(systemName: "chart.bar.fill")
                                        .font(.system(size: 40))
                                        .foregroundColor(.designMutedForeground)
                                    
                                    Text("Charts coming soon")
                                        .font(.designBodyMedium)
                                        .foregroundColor(.designMutedForeground)
                                }
                            )
                    }
                }
                .padding()
            }
            .navigationTitle("Business Dashboard")
            .onAppear {
                loadDashboardData()
            }
        }
    }
    
    private func loadDashboardData() {
        isLoading = true
        
        // Simulate API call
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
            revenue = 15000.0
            orderCount = 45
            inventoryCount = 120
            isLoading = false
        }
    }
}

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 24))
                .foregroundColor(.designPrimary)
            
            Text(value)
                .font(.designHeadlineLarge)
            
            Text(title)
                .font(.designLabelSmall)
                .foregroundColor(.designMutedForeground)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color.designMuted)
        .cornerRadius(DesignTokens.BorderRadius.lg)
    }
}

#Preview {
    DashboardView()
        .environmentObject(AuthService())
}