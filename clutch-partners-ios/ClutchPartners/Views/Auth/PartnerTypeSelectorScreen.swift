import SwiftUI

struct PartnerTypeSelectorScreen: View {
    @EnvironmentObject var router: AppRouter
    @State private var selectedType: PartnerType?
    
    private let partnerTypes = [
        PartnerType(id: "repair", title: "Repair Center", description: "Auto repair and maintenance services", icon: "wrench.and.screwdriver.fill", color: .blue),
        PartnerType(id: "parts", title: "Auto Parts", description: "Parts and accessories retail", icon: "car.fill", color: .green),
        PartnerType(id: "accessories", title: "Accessories", description: "Car accessories and modifications", icon: "star.fill", color: .orange),
        PartnerType(id: "importer", title: "Importer", description: "Import and distribute automotive products", icon: "shippingbox.fill", color: .purple),
        PartnerType(id: "manufacturer", title: "Manufacturer", description: "Manufacture automotive components", icon: "gearshape.fill", color: .red),
        PartnerType(id: "service", title: "Service Center", description: "General automotive services", icon: "wrench.fill", color: .teal)
    ]
    
    var body: some View {
        VStack(spacing: 30) {
            VStack(spacing: 10) {
                Text("Choose Your Business Type")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("Select the type of automotive business you operate")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .multilineTextAlignment(.center)
            }
            .padding(.top, 50)
            
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: 20) {
                ForEach(partnerTypes, id: \.id) { type in
                    PartnerTypeCard(
                        type: type,
                        isSelected: selectedType?.id == type.id
                    ) {
                        selectedType = type
                    }
                }
            }
            .padding(.horizontal)
            
            Spacer()
            
            Button(action: {
                if let selected = selectedType {
                    router.navigateTo(.auth)
                }
            }) {
                Text("Continue")
                    .font(.headline)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(selectedType != nil ? Color.blue : Color.gray)
                    .cornerRadius(10)
            }
            .disabled(selectedType == nil)
            .padding(.horizontal)
            .padding(.bottom, 50)
        }
        .background(Color(.systemBackground))
    }
}

struct PartnerType {
    let id: String
    let title: String
    let description: String
    let icon: String
    let color: Color
}

struct PartnerTypeCard: View {
    let type: PartnerType
    let isSelected: Bool
    let onTap: () -> Void
    
    var body: some View {
        Button(action: onTap) {
            VStack(spacing: 15) {
                Image(systemName: type.icon)
                    .font(.system(size: 40))
                    .foregroundColor(isSelected ? .white : type.color)
                
                VStack(spacing: 5) {
                    Text(type.title)
                        .font(.headline)
                        .fontWeight(.semibold)
                        .foregroundColor(isSelected ? .white : .primary)
                    
                    Text(type.description)
                        .font(.caption)
                        .foregroundColor(isSelected ? .white.opacity(0.8) : .secondary)
                        .multilineTextAlignment(.center)
                }
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(isSelected ? type.color : Color(.systemGray6))
            .cornerRadius(15)
            .overlay(
                RoundedRectangle(cornerRadius: 15)
                    .stroke(isSelected ? type.color : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(PlainButtonStyle())
    }
}

#Preview {
    PartnerTypeSelectorScreen()
        .environmentObject(AppRouter())
}
