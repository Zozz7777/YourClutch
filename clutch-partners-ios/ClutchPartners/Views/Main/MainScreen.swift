import SwiftUI

struct MainScreen: View {
    @EnvironmentObject var router: AppRouter
    @State private var selectedTab: Tab = .home
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeScreen()
                .tabItem {
                    Image(systemName: Tab.home.icon)
                    Text(Tab.home.title)
                }
                .tag(Tab.home)
            
            DashboardScreen()
                .tabItem {
                    Image(systemName: Tab.dashboard.icon)
                    Text(Tab.dashboard.title)
                }
                .tag(Tab.dashboard)
            
            PaymentsScreen()
                .tabItem {
                    Image(systemName: Tab.payments.icon)
                    Text(Tab.payments.title)
                }
                .tag(Tab.payments)
            
            SettingsScreen()
                .tabItem {
                    Image(systemName: Tab.settings.icon)
                    Text(Tab.settings.title)
                }
                .tag(Tab.settings)
        }
        .onChange(of: selectedTab) { newTab in
            router.selectedTab = newTab
        }
    }
}

#Preview {
    MainScreen()
        .environmentObject(AppRouter())
}
