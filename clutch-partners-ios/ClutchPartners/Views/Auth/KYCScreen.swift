import SwiftUI
import PhotosUI

struct KYCScreen: View {
    @EnvironmentObject var router: AppRouter
    @State private var selectedDocuments: [DocumentType: UIImage] = [:]
    @State private var showingImagePicker = false
    @State private var selectedDocumentType: DocumentType?
    @State private var isUploading = false
    @State private var uploadProgress: Double = 0
    @State private var verificationStatus = "pending"
    
    private let documentTypes = [
        DocumentType(id: "license", title: "Business License", description: "Upload your business license"),
        DocumentType(id: "tax", title: "Tax Certificate", description: "Upload your tax registration certificate"),
        DocumentType(id: "insurance", title: "Insurance Certificate", description: "Upload your business insurance certificate"),
        DocumentType(id: "bank", title: "Bank Statement", description: "Upload your bank statement")
    ]
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 30) {
                    VStack(spacing: 20) {
                        Text("KYC Verification")
                            .font(.largeTitle)
                            .fontWeight(.bold)
                        
                        Text("Upload required documents for verification")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                            .multilineTextAlignment(.center)
                    }
                    .padding(.top, 20)
                    
                    if verificationStatus == "pending" {
                        VStack(spacing: 20) {
                            ForEach(documentTypes, id: \.id) { documentType in
                                DocumentUploadCard(
                                    documentType: documentType,
                                    uploadedImage: selectedDocuments[documentType],
                                    onUpload: {
                                        selectedDocumentType = documentType
                                        showingImagePicker = true
                                    },
                                    onRemove: {
                                        selectedDocuments.removeValue(forKey: documentType)
                                    }
                                )
                            }
                            
                            if isUploading {
                                VStack(spacing: 10) {
                                    ProgressView(value: uploadProgress)
                                        .progressViewStyle(LinearProgressViewStyle())
                                    
                                    Text("Uploading documents... \(Int(uploadProgress * 100))%")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            Button(action: submitDocuments) {
                                Text("Submit for Verification")
                                    .font(.headline)
                                    .foregroundColor(.white)
                                    .frame(maxWidth: .infinity)
                                    .padding()
                                    .background(isAllDocumentsUploaded ? Color.blue : Color.gray)
                                    .cornerRadius(10)
                            }
                            .disabled(!isAllDocumentsUploaded || isUploading)
                        }
                        .padding(.horizontal)
                        
                    } else if verificationStatus == "verified" {
                        VStack(spacing: 20) {
                            Image(systemName: "checkmark.circle.fill")
                                .font(.system(size: 60))
                                .foregroundColor(.green)
                            
                            Text("Verification Complete")
                                .font(.title2)
                                .fontWeight(.semibold)
                            
                            Text("Your documents have been verified. You can now access your account.")
                                .font(.body)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                            
                            Button("Continue to Dashboard") {
                                router.isAuthenticated = true
                            }
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .cornerRadius(10)
                        }
                        .padding(.horizontal)
                        
                    } else if verificationStatus == "rejected" {
                        VStack(spacing: 20) {
                            Image(systemName: "xmark.circle.fill")
                                .font(.system(size: 60))
                                .foregroundColor(.red)
                            
                            Text("Verification Rejected")
                                .font(.title2)
                                .fontWeight(.semibold)
                            
                            Text("Your documents were not accepted. Please upload clear, readable documents and try again.")
                                .font(.body)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                            
                            Button("Upload Again") {
                                verificationStatus = "pending"
                                selectedDocuments.removeAll()
                            }
                            .font(.headline)
                            .foregroundColor(.white)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.blue)
                            .cornerRadius(10)
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
        .sheet(isPresented: $showingImagePicker) {
            ImagePicker(selectedImage: Binding(
                get: { selectedDocuments[selectedDocumentType ?? documentTypes[0]] ?? UIImage() },
                set: { newImage in
                    if let type = selectedDocumentType {
                        selectedDocuments[type] = newImage
                    }
                }
            ))
        }
    }
    
    private var isAllDocumentsUploaded: Bool {
        documentTypes.allSatisfy { selectedDocuments[$0] != nil }
    }
    
    private func submitDocuments() {
        isUploading = true
        uploadProgress = 0
        
        // Simulate upload progress
        Timer.scheduledTimer(withTimeInterval: 0.1, repeats: true) { timer in
            uploadProgress += 0.1
            if uploadProgress >= 1.0 {
                timer.invalidate()
                isUploading = false
                // Simulate verification result
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                    verificationStatus = "verified"
                }
            }
        }
    }
}

struct DocumentType: Hashable {
    let id: String
    let title: String
    let description: String
}

struct DocumentUploadCard: View {
    let documentType: DocumentType
    let uploadedImage: UIImage?
    let onUpload: () -> Void
    let onRemove: () -> Void
    
    var body: some View {
        VStack(spacing: 15) {
            HStack {
                VStack(alignment: .leading, spacing: 5) {
                    Text(documentType.title)
                        .font(.headline)
                        .fontWeight(.semibold)
                    
                    Text(documentType.description)
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                if uploadedImage != nil {
                    Button("Remove", action: onRemove)
                        .font(.caption)
                        .foregroundColor(.red)
                }
            }
            
            if let image = uploadedImage {
                Image(uiImage: image)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(height: 150)
                    .cornerRadius(10)
            } else {
                Button(action: onUpload) {
                    VStack(spacing: 10) {
                        Image(systemName: "camera.fill")
                            .font(.system(size: 30))
                            .foregroundColor(.blue)
                        
                        Text("Tap to Upload")
                            .font(.subheadline)
                            .foregroundColor(.blue)
                    }
                    .frame(height: 150)
                    .frame(maxWidth: .infinity)
                    .background(Color.blue.opacity(0.1))
                    .cornerRadius(10)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(15)
    }
}

struct ImagePicker: UIViewControllerRepresentable {
    @Binding var selectedImage: UIImage
    @Environment(\.presentationMode) var presentationMode
    
    func makeUIViewController(context: Context) -> UIImagePickerController {
        let picker = UIImagePickerController()
        picker.delegate = context.coordinator
        picker.sourceType = .photoLibrary
        return picker
    }
    
    func updateUIViewController(_ uiViewController: UIImagePickerController, context: Context) {}
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
        let parent: ImagePicker
        
        init(_ parent: ImagePicker) {
            self.parent = parent
        }
        
        func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
            if let image = info[.originalImage] as? UIImage {
                parent.selectedImage = image
            }
            parent.presentationMode.wrappedValue.dismiss()
        }
        
        func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
            parent.presentationMode.wrappedValue.dismiss()
        }
    }
}

#Preview {
    KYCScreen()
        .environmentObject(AppRouter())
}
