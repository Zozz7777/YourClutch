import SwiftUI

struct PaymentsScreen: View {
    @EnvironmentObject var router: AppRouter
    @State private var selectedPeriod = "This Week"
    
    private let periods = ["This Week", "This Month", "Last Month", "This Year"]
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(spacing: 20) {
                    // Weekly Income
                    VStack(alignment: .leading, spacing: 15) {
                        HStack {
                            Text("Weekly Income")
                                .font(.title2)
                                .fontWeight(.semibold)
                            
                            Spacer()
                            
                            Menu {
                                ForEach(periods, id: \.self) { period in
                                    Button(period) {
                                        selectedPeriod = period
                                    }
                                }
                            } label: {
                                HStack {
                                    Text(selectedPeriod)
                                    Image(systemName: "chevron.down")
                                }
                                .font(.subheadline)
                                .foregroundColor(.blue)
                            }
                        }
                        .padding(.horizontal)
                        
                        WeeklyIncomeCard()
                            .padding(.horizontal)
                    }
                    
                    // Commission Breakdown
                    VStack(alignment: .leading, spacing: 15) {
                        Text("Commission Breakdown")
                            .font(.title2)
                            .fontWeight(.semibold)
                            .padding(.horizontal)
                        
                        LazyVStack(spacing: 10) {
                            CommissionRow(title: "Service Commission", amount: "$1,250", percentage: "5%")
                            CommissionRow(title: "Product Commission", amount: "$890", percentage: "3%")
                            CommissionRow(title: "Referral Commission", amount: "$150", percentage: "2%")
                        }
                        .padding(.horizontal)
                    }
                    
                    // Payout History
                    VStack(alignment: .leading, spacing: 15) {
                        HStack {
                            Text("Payout History")
                                .font(.title2)
                                .fontWeight(.semibold)
                            
                            Spacer()
                            
                            Button("View All") {
                                // TODO: Navigate to full history
                            }
                            .font(.subheadline)
                            .foregroundColor(.blue)
                        }
                        .padding(.horizontal)
                        
                        LazyVStack(spacing: 10) {
                            ForEach(samplePayouts, id: \.id) { payout in
                                PayoutCard(payout: payout)
                            }
                        }
                        .padding(.horizontal)
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Payments")
        }
    }
}

struct WeeklyIncomeCard: View {
    var body: some View {
        VStack(spacing: 15) {
            HStack {
                VStack(alignment: .leading, spacing: 5) {
                    Text("This Week")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    Text("$2,450")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.green)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 5) {
                    Text("+12%")
                        .font(.subheadline)
                        .fontWeight(.medium)
                        .foregroundColor(.green)
                    
                    Text("vs last week")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
            
            HStack(spacing: 20) {
                VStack(alignment: .leading, spacing: 5) {
                    Text("Orders")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("24")
                        .font(.headline)
                        .fontWeight(.semibold)
                }
                
                VStack(alignment: .leading, spacing: 5) {
                    Text("Avg Order")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text("$102")
                        .font(.headline)
                        .fontWeight(.semibold)
                }
                
                Spacer()
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(15)
        .shadow(color: .black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
}

struct CommissionRow: View {
    let title: String
    let amount: String
    let percentage: String
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(percentage)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            Text(amount)
                .font(.headline)
                .fontWeight(.semibold)
                .foregroundColor(.green)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}

struct PayoutCard: View {
    let payout: Payout
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 5) {
                Text("Payout #\(payout.id)")
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(payout.date)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
            
            VStack(alignment: .trailing, spacing: 5) {
                Text(payout.amount)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.green)
                
                Text(payout.status)
                    .font(.caption)
                    .foregroundColor(payout.status == "Completed" ? .green : .orange)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(10)
        .shadow(color: .black.opacity(0.1), radius: 2, x: 0, y: 1)
    }
}

struct Payout {
    let id: String
    let amount: String
    let date: String
    let status: String
}

let samplePayouts = [
    Payout(id: "P001", amount: "$2,450", date: "Dec 15, 2024", status: "Completed"),
    Payout(id: "P002", amount: "$1,890", date: "Dec 8, 2024", status: "Completed"),
    Payout(id: "P003", amount: "$3,120", date: "Dec 1, 2024", status: "Pending")
]

#Preview {
    PaymentsScreen()
        .environmentObject(AppRouter())
}
