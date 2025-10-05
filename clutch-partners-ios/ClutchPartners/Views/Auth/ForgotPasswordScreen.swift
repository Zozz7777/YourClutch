import SwiftUI

struct ForgotPasswordScreen: View {
    @EnvironmentObject var router: AppRouter
    @State private var email = ""
    @State private var isEmailSent = false
    @State private var otp = ""
    @State private var newPassword = ""
    @State private var confirmPassword = ""
    @State private var currentStep = 1 // 1: Email, 2: OTP, 3: New Password
    
    var body: some View {
        NavigationView {
            VStack(spacing: 30) {
                VStack(spacing: 20) {
                    Text("Reset Password")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                    
                    Text(stepDescription)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 50)
                
                VStack(spacing: 20) {
                    if currentStep == 1 {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Email Address")
                                .font(.subheadline)
                                .fontWeight(.medium)
                            
                            TextField("Enter your email", text: $email)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)
                        }
                        
                        Button(action: sendResetEmail) {
                            Text("Send Reset Code")
                                .font(.headline)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(email.isEmpty ? Color.gray : Color.blue)
                                .cornerRadius(10)
                        }
                        .disabled(email.isEmpty)
                        
                    } else if currentStep == 2 {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Verification Code")
                                .font(.subheadline)
                                .fontWeight(.medium)
                            
                            TextField("Enter 6-digit code", text: $otp)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                                .keyboardType(.numberPad)
                                .multilineTextAlignment(.center)
                        }
                        
                        Button(action: verifyOTP) {
                            Text("Verify Code")
                                .font(.headline)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(otp.count == 6 ? Color.blue : Color.gray)
                                .cornerRadius(10)
                        }
                        .disabled(otp.count != 6)
                        
                        Button("Resend Code") {
                            sendResetEmail()
                        }
                        .foregroundColor(.blue)
                        
                    } else if currentStep == 3 {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("New Password")
                                .font(.subheadline)
                                .fontWeight(.medium)
                            
                            SecureField("Enter new password", text: $newPassword)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                        
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Confirm Password")
                                .font(.subheadline)
                                .fontWeight(.medium)
                            
                            SecureField("Confirm new password", text: $confirmPassword)
                                .textFieldStyle(RoundedBorderTextFieldStyle())
                        }
                        
                        Button(action: resetPassword) {
                            Text("Reset Password")
                                .font(.headline)
                                .foregroundColor(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(isPasswordValid ? Color.blue : Color.gray)
                                .cornerRadius(10)
                        }
                        .disabled(!isPasswordValid)
                    }
                }
                .padding(.horizontal)
                
                Spacer()
                
                HStack {
                    Text("Remember your password?")
                        .foregroundColor(.secondary)
                    
                    Button("Sign In") {
                        router.navigateTo(.signIn)
                    }
                    .foregroundColor(.blue)
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarBackButtonHidden(true)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Back") {
                        if currentStep > 1 {
                            currentStep -= 1
                        } else {
                            router.navigateBack()
                        }
                    }
                }
            }
        }
    }
    
    private var stepDescription: String {
        switch currentStep {
        case 1:
            return "Enter your email address and we'll send you a verification code"
        case 2:
            return "Enter the 6-digit code sent to your email"
        case 3:
            return "Create a new password for your account"
        default:
            return ""
        }
    }
    
    private var isPasswordValid: Bool {
        !newPassword.isEmpty &&
        newPassword == confirmPassword &&
        newPassword.count >= 6
    }
    
    private func sendResetEmail() {
        // TODO: Implement actual email sending
        currentStep = 2
    }
    
    private func verifyOTP() {
        // TODO: Implement actual OTP verification
        currentStep = 3
    }
    
    private func resetPassword() {
        // TODO: Implement actual password reset
        router.navigateTo(.signIn)
    }
}

#Preview {
    ForgotPasswordScreen()
        .environmentObject(AppRouter())
}
