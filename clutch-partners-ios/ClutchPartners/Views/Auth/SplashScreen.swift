import SwiftUI

struct SplashScreen: View {
    @EnvironmentObject var router: AppRouter
    @State private var isAnimating = false
    
    var body: some View {
        VStack(spacing: 30) {
            // Logo
            Image(systemName: "wrench.and.screwdriver.fill")
                .font(.system(size: 80))
                .foregroundColor(.blue)
                .scaleEffect(isAnimating ? 1.1 : 1.0)
                .animation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true), value: isAnimating)
            
            Text("Clutch Partners")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.primary)
            
            Text("Connecting automotive partners")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            ProgressView()
                .scaleEffect(1.2)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.systemBackground))
        .onAppear {
            isAnimating = true
            // Simulate loading and check authentication
            DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
                // Check if user is already authenticated
                // For now, navigate to onboarding
                router.navigateTo(.onboarding)
            }
        }
    }
}

#Preview {
    SplashScreen()
        .environmentObject(AppRouter())
}
