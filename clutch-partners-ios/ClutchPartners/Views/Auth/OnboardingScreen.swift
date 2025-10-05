import SwiftUI

struct OnboardingScreen: View {
    @EnvironmentObject var router: AppRouter
    @State private var currentPage = 0
    
    private let pages = [
        OnboardingPage(
            title: "Welcome to Clutch Partners",
            description: "Join the automotive ecosystem and grow your business with our comprehensive platform.",
            imageName: "wrench.and.screwdriver.fill",
            color: .blue
        ),
        OnboardingPage(
            title: "Manage Your Business",
            description: "Track orders, manage inventory, and process payments all in one place.",
            imageName: "chart.bar.fill",
            color: .green
        ),
        OnboardingPage(
            title: "Connect with Customers",
            description: "Build loyalty programs, manage appointments, and provide excellent service.",
            imageName: "person.2.fill",
            color: .orange
        )
    ]
    
    var body: some View {
        VStack {
            TabView(selection: $currentPage) {
                ForEach(0..<pages.count, id: \.self) { index in
                    OnboardingPageView(page: pages[index])
                        .tag(index)
                }
            }
            .tabViewStyle(PageTabViewStyle(indexDisplayMode: .automatic))
            
            VStack(spacing: 20) {
                HStack {
                    ForEach(0..<pages.count, id: \.self) { index in
                        Circle()
                            .fill(index == currentPage ? Color.blue : Color.gray.opacity(0.3))
                            .frame(width: 8, height: 8)
                    }
                }
                
                Button(action: {
                    if currentPage < pages.count - 1 {
                        withAnimation {
                            currentPage += 1
                        }
                    } else {
                        router.navigateTo(.partnerTypeSelector)
                    }
                }) {
                    Text(currentPage < pages.count - 1 ? "Next" : "Get Started")
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .cornerRadius(10)
                }
                .padding(.horizontal)
                
                Button("Skip") {
                    router.navigateTo(.partnerTypeSelector)
                }
                .foregroundColor(.secondary)
            }
            .padding(.bottom, 50)
        }
        .background(Color(.systemBackground))
    }
}

struct OnboardingPage {
    let title: String
    let description: String
    let imageName: String
    let color: Color
}

struct OnboardingPageView: View {
    let page: OnboardingPage
    
    var body: some View {
        VStack(spacing: 40) {
            Spacer()
            
            Image(systemName: page.imageName)
                .font(.system(size: 100))
                .foregroundColor(page.color)
            
            VStack(spacing: 20) {
                Text(page.title)
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)
                
                Text(page.description)
                    .font(.body)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            
            Spacer()
        }
        .padding()
    }
}

#Preview {
    OnboardingScreen()
        .environmentObject(AppRouter())
}
