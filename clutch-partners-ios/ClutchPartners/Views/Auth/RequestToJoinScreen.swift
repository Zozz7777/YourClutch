import SwiftUI

struct RequestToJoinScreen: View {
    @EnvironmentObject var router: AppRouter
    @State private var businessName = ""
    @State private var businessType = ""
    @State private var contactName = ""
    @State private var email = ""
    @State private var phone = ""
    @State private var address = ""
    @State private var licenseNumber = ""
    @State private var description = ""
    @State private var isSubmitted = false
    
    private let businessTypes = [
        "Repair Center",
        "Auto Parts",
        "Accessories",
        "Importer",
        "Manufacturer",
        "Service Center"
    ]
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 30) {
                    VStack(spacing: 20) {
                        Text("Request to Join")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("Submit your business information for review")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 20)
                    
                    if isSubmitted {
                        VStack(spacing: 20) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 60))
                                .foregroundColor(.green)
                            
                            Text("Request Submitted")
                                .font(.title2)
                                .fontWeight(.semibold)
                            
                            Text("Your request has been submitted for review. We'll contact you within 2-3 business days.")
                                .font(.body)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                            
                            Button("Back to Sign In") {
                                router.navigateTo(.signIn)
                            }
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .cornerRadius(10)
                        }
                        .padding(.horizontal)
                    } else {
                        VStack(spacing: 20) {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Business Name")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Enter business name", text: $businessName)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Business Type")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                Picker("Select business type", selection: $businessType) {
                                    Text("Select type").tag("")
                                    ForEach(businessTypes, id: \.self) { type in
                                        Text(type).tag(type)
                                    }
                                }
                                .pickerStyle(MenuPickerStyle())
                                .padding()
                                .background(Color(.systemGray6))
                                .cornerRadius(8)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Contact Name")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Enter contact name", text: $contactName)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Email")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Enter email address", text: $email)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .keyboardType(.emailAddress)
                                    .autocapitalization(.none)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Phone Number")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Enter phone number", text: $phone)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .keyboardType(.phonePad)
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Business Address")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Enter business address", text: $address)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("License Number")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Enter license number", text: $licenseNumber)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                            }
                            
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Business Description")
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                                
                                TextField("Describe your business", text: $description, axis: .vertical)
                                    .textFieldStyle(RoundedBorderTextFieldStyle())
                                    .lineLimit(3...6)
                            }
                            
                            Button(action: submitRequest) {
                                Text("Submit Request")
                                    .font(.headline)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(isFormValid ? Color.blue : Color.gray)
                                    .cornerRadius(10)
                            }
                            .disabled(!isFormValid)
                        }
                        .padding(.horizontal)
                    }
                }
                .padding(.bottom, 50)
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
    
    private var isFormValid: Bool {
        !businessName.isEmpty &&
        !businessType.isEmpty &&
        !contactName.isEmpty &&
        !email.isEmpty &&
        !phone.isEmpty &&
        !address.isEmpty &&
        !licenseNumber.isEmpty
    }
    
    private func submitRequest() {
        // TODO: Implement actual request submission
        isSubmitted = true
    }
}

#Preview {
    RequestToJoinScreen()
        .environmentObject(AppRouter())
}
