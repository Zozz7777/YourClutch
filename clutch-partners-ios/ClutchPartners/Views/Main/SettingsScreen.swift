import SwiftUI

struct SettingsScreen: View {
    @EnvironmentObject var router: AppRouter
    @State private var isDarkMode = false
    @State private var selectedLanguage = "English"
    @State private var isBiometricEnabled = false
    @State private var isNotificationsEnabled = true
    
    private let languages = ["English", "العربية"]
    
    var body: some View {
        NavigationView {
            List {
                // Profile Section
                Section {
                    HStack {
                        Circle()
                            .fill(Color.blue)
                            .frame(width: 50, height: 50)
                            .overlay(
                                Text("JD")
                                    .font(.headline)
                                    .fontWeight(.semibold)
                                    .foregroundColor(.white)
                            )
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("John Doe")
                                .font(.headline)
                                .fontWeight(.semibold)
                            
                            Text("john.doe@example.com")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                            
                            Text("Repair Center")
                                .font(.caption)
                                .foregroundColor(.blue)
                        }
                        
                        Spacer()
                        
                        Button("Edit") {
                            // TODO: Navigate to profile edit
                        }
                        .font(.subheadline)
                        .foregroundColor(.blue)
                    }
                    .padding(.vertical, 8)
                }
                
                // Account Settings
                Section("Account") {
                    NavigationLink(destination: Text("Locations")) {
                        HStack {
                            Image(systemName: "location.fill")
                                .foregroundColor(.blue)
                                .frame(width: 24)
                            
                            Text("Manage Locations")
                        }
                    }
                    
                    NavigationLink(destination: Text("Staff")) {
                        HStack {
                            Image(systemName: "person.2.fill")
                                .foregroundColor(.green)
                                .frame(width: 24)
                            
                            Text("Staff Management")
                        }
                    }
                    
                    NavigationLink(destination: Text("Contracts")) {
                        HStack {
                            Image(systemName: "doc.text.fill")
                                .foregroundColor(.orange)
                                .frame(width: 24)
                            
                            Text("Contracts")
                        }
                    }
                }
                
                // App Settings
                Section("App Settings") {
                    HStack {
                        Image(systemName: "moon.fill")
                            .foregroundColor(.purple)
                            .frame(width: 24)
                        
                        Text("Dark Mode")
                        
                        Spacer()
                        
                        Toggle("", isOn: $isDarkMode)
                    }
                    
                    HStack {
                        Image(systemName: "globe")
                            .foregroundColor(.blue)
                            .frame(width: 24)
                        
                        Text("Language")
                        
                        Spacer()
                        
                        Menu {
                            ForEach(languages, id: \.self) { language in
                                Button(language) {
                                    selectedLanguage = language
                                }
                            }
                        } label: {
                            Text(selectedLanguage)
                                .foregroundColor(.blue)
                        }
                    }
                    
                    HStack {
                        Image(systemName: "faceid")
                            .foregroundColor(.green)
                            .frame(width: 24)
                        
                        Text("Biometric Login")
                        
                        Spacer()
                        
                        Toggle("", isOn: $isBiometricEnabled)
                    }
                }
                
                // Notifications
                Section("Notifications") {
                    HStack {
                        Image(systemName: "bell.fill")
                            .foregroundColor(.red)
                            .frame(width: 24)
                        
                        Text("Push Notifications")
                        
                        Spacer()
                        
                        Toggle("", isOn: $isNotificationsEnabled)
                    }
                    
                    NavigationLink(destination: Text("Notification Settings")) {
                        HStack {
                            Image(systemName: "gearshape.fill")
                                .foregroundColor(.gray)
                                .frame(width: 24)
                            
                            Text("Notification Settings")
                        }
                    }
                }
                
                // Support
                Section("Support") {
                    NavigationLink(destination: Text("Help Center")) {
                        HStack {
                            Image(systemName: "questionmark.circle.fill")
                                .foregroundColor(.blue)
                                .frame(width: 24)
                            
                            Text("Help Center")
                        }
                    }
                    
                    NavigationLink(destination: Text("Contact Support")) {
                        HStack {
                            Image(systemName: "message.fill")
                                .foregroundColor(.green)
                                .frame(width: 24)
                            
                            Text("Contact Support")
                        }
                    }
                    
                    NavigationLink(destination: Text("About")) {
                        HStack {
                            Image(systemName: "info.circle.fill")
                                .foregroundColor(.gray)
                                .frame(width: 24)
                            
                            Text("About")
                        }
                    }
                }
                
                // Logout
                Section {
                    Button(action: logout) {
                        HStack {
                            Image(systemName: "power")
                                .foregroundColor(.red)
                                .frame(width: 24)
                            
                            Text("Logout")
                                .foregroundColor(.red)
                        }
                    }
                }
            }
            .navigationTitle("Settings")
        }
    }
    
    private func logout() {
        router.isAuthenticated = false
    }
}

#Preview {
    SettingsScreen()
        .environmentObject(AppRouter())
}
