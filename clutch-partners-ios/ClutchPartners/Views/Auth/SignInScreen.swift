import SwiftUI

struct SignInScreen: View {
    @EnvironmentObject var router: AppRouter
    @State private var email = ""
    @State private var password = ""
    @State private var rememberMe = false
    @State private var showBiometric = false
    
    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                VStack(spacing: 20) {
                    Text("Sign In")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                    
                    Text("Enter your credentials to access your account")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 50)
                
                VStack(spacing: 20) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Email or Phone")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        
                        TextField("Enter email or phone", text: $email)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)
                    }
                    
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Password")
                            .font(.subheadline)
                            .fontWeight(.medium)
                        
                        SecureField("Enter password", text: $password)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                    }
                    
                    HStack {
                        Toggle("Remember Me", isOn: $rememberMe)
                            .toggleStyle(SwitchToggleStyle())
                        
                        Spacer()
                        
                        Button("Forgot Password?") {
                            router.navigateTo(.forgotPassword)
                        }
                        .font(.subheadline)
                        .foregroundColor(.blue)
                    }
                }
                .padding(.horizontal)
                
                VStack(spacing: 15) {
                    Button(action: signIn) {
                        Text("Sign In")
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .cornerRadius(10)
                    }
                    .disabled(email.isEmpty || password.isEmpty)
                    
                    if showBiometric {
                        Button(action: signInWithBiometric) {
                            HStack {
                                Image(systemName: "faceid")
                                Text("Sign in with Face ID")
                            }
                            .font(.headline)
                            .foregroundColor(.blue)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue.opacity(0.1))
                            .cornerRadius(10)
                        }
                    }
                }
                .padding(.horizontal)
                
                Spacer()
                
                HStack {
                    Text("Don't have an account?")
                        .foregroundColor(.secondary)
                    
                    Button("Sign Up") {
                        router.navigateTo(.signUp)
                    }
                    .foregroundColor(.blue)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Back") {
                        router.navigateBack()
                    }
                }
            }
        }
    }
    
    private func signIn() {
        // TODO: Implement actual sign in logic
        router.isAuthenticated = true
    }
    
    private func signInWithBiometric() {
        // TODO: Implement biometric authentication
        router.isAuthenticated = true
    }
}

#Preview {
    SignInScreen()
        .environmentObject(AppRouter())
}
